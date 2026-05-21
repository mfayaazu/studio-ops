package com.studioops.dashboard;

import com.studioops.assignment.AssignmentStatus;
import com.studioops.assignment.EventAssignment;
import com.studioops.assignment.EventAssignmentRepository;
import com.studioops.backup.BackupLocationType;
import com.studioops.backup.BackupRecordRepository;
import com.studioops.backup.BackupStatus;
import com.studioops.client.ClientRepository;
import com.studioops.deliverable.Deliverable;
import com.studioops.deliverable.DeliverableRepository;
import com.studioops.employee.Employee;
import com.studioops.employee.EmployeeRepository;
import com.studioops.event.Event;
import com.studioops.event.EventRepository;
import com.studioops.event.EventStatus;
import com.studioops.project.Project;
import com.studioops.project.ProjectRepository;
import com.studioops.project.ProjectStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final EventRepository eventRepository;
    private final BackupRecordRepository backupRecordRepository;
    private final EmployeeRepository employeeRepository;
    private final EventAssignmentRepository eventAssignmentRepository;
    private final DeliverableRepository deliverableRepository;

    public DashboardService(ClientRepository clientRepository,
                            ProjectRepository projectRepository,
                            EventRepository eventRepository,
                            BackupRecordRepository backupRecordRepository,
                            EmployeeRepository employeeRepository,
                            EventAssignmentRepository eventAssignmentRepository,
                            DeliverableRepository deliverableRepository) {
        this.clientRepository = clientRepository;
        this.projectRepository = projectRepository;
        this.eventRepository = eventRepository;
        this.backupRecordRepository = backupRecordRepository;
        this.employeeRepository = employeeRepository;
        this.eventAssignmentRepository = eventAssignmentRepository;
        this.deliverableRepository = deliverableRepository;
    }

    public DashboardSummaryResponse getSummary() {
        // 1. Statistics
        long totalClients = clientRepository.count();
        long activeProjects = projectRepository.countByStatusNotIn(List.of(ProjectStatus.ARCHIVED, ProjectStatus.CANCELLED));
        long upcomingEvents = eventRepository.countByStatusAndEventDateGreaterThanEqual(EventStatus.SCHEDULED, LocalDate.now());
        long successfulBackups = backupRecordRepository.countByStatus(BackupStatus.COMPLETED);

        DashboardStats stats = new DashboardStats(totalClients, activeProjects, upcomingEvents, successfulBackups);

        // 2. Warnings (Double Bookings)
        List<DashboardWarning> warnings = getDoubleBookingWarnings();

        // 3. Backup Checklists
        List<DashboardBackupChecklist> backupChecklists = getBackupChecklists();

        return new DashboardSummaryResponse(stats, warnings, backupChecklists);
    }

    private List<DashboardWarning> getDoubleBookingWarnings() {
        List<DashboardWarning> warnings = new ArrayList<>();
        List<EventAssignment> allAssignments = eventAssignmentRepository.findAll();
        List<Event> allEvents = eventRepository.findAll();
        List<Employee> allEmployees = employeeRepository.findAll();

        Map<UUID, Event> eventMap = allEvents.stream()
                .collect(Collectors.toMap(Event::getId, Function.identity(), (e1, e2) -> e1));
        Map<UUID, Employee> employeeMap = allEmployees.stream()
                .collect(Collectors.toMap(Employee::getId, Function.identity(), (emp1, emp2) -> emp1));

        // Filter active assignments: NOT CANCELLED and NOT REJECTED
        List<EventAssignment> activeAssignments = allAssignments.stream()
                .filter(a -> a.getAssignmentStatus() != AssignmentStatus.CANCELLED 
                        && a.getAssignmentStatus() != AssignmentStatus.REJECTED)
                .filter(a -> eventMap.containsKey(a.getEventId()))
                .collect(Collectors.toList());

        // Group by employee and eventDate
        Map<UUID, Map<LocalDate, List<EventAssignment>>> grouped = activeAssignments.stream()
                .collect(Collectors.groupingBy(
                        EventAssignment::getEmployeeId,
                        Collectors.groupingBy(a -> eventMap.get(a.getEventId()).getEventDate())
                ));

        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm:ss");

        for (Map.Entry<UUID, Map<LocalDate, List<EventAssignment>>> employeeEntry : grouped.entrySet()) {
            UUID employeeId = employeeEntry.getKey();
            String employeeName = employeeMap.containsKey(employeeId) 
                    ? employeeMap.get(employeeId).getFullName() 
                    : "Unknown Employee";

            for (Map.Entry<LocalDate, List<EventAssignment>> dateEntry : employeeEntry.getValue().entrySet()) {
                List<EventAssignment> list = dateEntry.getValue();
                if (list.size() > 1) {
                    for (int i = 0; i < list.size(); i++) {
                        for (int j = i + 1; j < list.size(); j++) {
                            EventAssignment a = list.get(i);
                            EventAssignment b = list.get(j);
                            Event ea = eventMap.get(a.getEventId());
                            Event eb = eventMap.get(b.getEventId());

                            if (ea.getStartTime().isBefore(eb.getEndTime()) && eb.getStartTime().isBefore(ea.getEndTime())) {
                                LocalTime overlapStart = ea.getStartTime().isAfter(eb.getStartTime()) ? ea.getStartTime() : eb.getStartTime();
                                LocalTime overlapEnd = ea.getEndTime().isBefore(eb.getEndTime()) ? ea.getEndTime() : eb.getEndTime();

                                String conflictTime = ea.getEventDate().toString() + "T" + overlapStart.format(timeFormatter) + "Z to " +
                                        ea.getEventDate().toString() + "T" + overlapEnd.format(timeFormatter) + "Z";

                                warnings.add(new DashboardWarning(
                                        "DOUBLE_BOOKING",
                                        employeeId,
                                        employeeName,
                                        ea.getId(),
                                        ea.getTitle(),
                                        eb.getTitle(),
                                        conflictTime
                                ));
                            }
                        }
                    }
                }
            }
        }

        return warnings;
    }

    private List<DashboardBackupChecklist> getBackupChecklists() {
        List<Deliverable> deliverables = deliverableRepository.findAll();
        List<Project> projects = projectRepository.findAll();

        Map<UUID, Project> projectMap = projects.stream()
                .collect(Collectors.toMap(Project::getId, Function.identity(), (p1, p2) -> p1));

        List<DashboardBackupChecklist> checklists = new ArrayList<>();

        for (Deliverable deliverable : deliverables) {
            Project project = projectMap.get(deliverable.getProjectId());
            if (project == null) {
                continue;
            }

            List<BackupLocationType> completedLocations = backupRecordRepository
                    .findDistinctCompletedLocationTypesByDeliverableId(deliverable.getId());
            
            int count = completedLocations.size();
            String status = count < 2 ? "WARNING_LOW_REDUNDANCY" : "SAFE";
            
            String details;
            if (count == 0) {
                details = "Requires at least 2 distinct backup locations (current: none).";
            } else if (count == 1) {
                details = "Requires at least 2 distinct backup locations (current: " + completedLocations.get(0).name() + ").";
            } else {
                String locations = completedLocations.stream()
                        .map(Enum::name)
                        .collect(Collectors.joining(", "));
                details = "Redundant backups verified (current: " + locations + ").";
            }

            checklists.add(new DashboardBackupChecklist(
                    project.getId(),
                    project.getTitle(),
                    deliverable.getId(),
                    deliverable.getName(),
                    count,
                    status,
                    details
            ));
        }

        return checklists;
    }
}
