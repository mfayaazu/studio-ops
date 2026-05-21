package com.studioops.project;

import com.studioops.client.ClientRepository;
import com.studioops.common.exception.ResourceNotFoundException;
import com.studioops.project.dto.ProjectCreateRequest;
import com.studioops.project.dto.ProjectResponse;
import com.studioops.project.dto.ProjectUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;

    public ProjectService(ProjectRepository projectRepository, ClientRepository clientRepository) {
        this.projectRepository = projectRepository;
        this.clientRepository = clientRepository;
    }

    public ProjectResponse createProject(ProjectCreateRequest request) {
        // Validate client exists
        if (!clientRepository.existsById(request.getClientId())) {
            throw new IllegalArgumentException("Client not found with id: " + request.getClientId());
        }

        // Validate unique projectCode
        String trimmedCode = request.getProjectCode().trim();
        if (projectRepository.findByProjectCode(trimmedCode).isPresent()) {
            throw new IllegalArgumentException("Project code already exists: " + trimmedCode);
        }

        // Validate date range
        if (request.getStartDate() != null && request.getEndDate() != null 
                && request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        Project project = new Project();
        project.setClientId(request.getClientId());
        project.setAssignedProjectManagerId(request.getAssignedProjectManagerId());
        project.setProjectCode(trimmedCode);
        project.setTitle(request.getTitle().trim());
        project.setProjectType(request.getProjectType().trim());

        project.setBookingStatus(request.getBookingStatus() != null ? request.getBookingStatus() : BookingStatus.INQUIRY);
        project.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : PaymentStatus.UNPAID);
        project.setStatus(request.getStatus() != null ? request.getStatus() : ProjectStatus.LEAD);

        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        Project saved = projectRepository.save(project);
        return ProjectMapper.toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> listProjects(String search) {
        List<Project> projects;
        if (search == null || search.trim().isEmpty()) {
            projects = projectRepository.findAll();
        } else {
            projects = projectRepository.searchProjects(search.trim());
        }
        return projects.stream()
                .map(ProjectMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(UUID id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        return ProjectMapper.toResponse(project);
    }

    public ProjectResponse updateProject(UUID id, ProjectUpdateRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        // Validate client exists
        if (!clientRepository.existsById(request.getClientId())) {
            throw new IllegalArgumentException("Client not found with id: " + request.getClientId());
        }

        // Validate unique projectCode
        String trimmedCode = request.getProjectCode().trim();
        Optional<Project> existingWithCode = projectRepository.findByProjectCode(trimmedCode);
        if (existingWithCode.isPresent() && !existingWithCode.get().getId().equals(id)) {
            throw new IllegalArgumentException("Project code already exists: " + trimmedCode);
        }

        // Validate date range
        if (request.getStartDate() != null && request.getEndDate() != null 
                && request.getStartDate().isAfter(request.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        project.setClientId(request.getClientId());
        project.setAssignedProjectManagerId(request.getAssignedProjectManagerId());
        project.setProjectCode(trimmedCode);
        project.setTitle(request.getTitle().trim());
        project.setProjectType(request.getProjectType().trim());

        project.setBookingStatus(request.getBookingStatus() != null ? request.getBookingStatus() : BookingStatus.INQUIRY);
        project.setPaymentStatus(request.getPaymentStatus() != null ? request.getPaymentStatus() : PaymentStatus.UNPAID);
        project.setStatus(request.getStatus() != null ? request.getStatus() : ProjectStatus.LEAD);

        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        project.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);

        Project updated = projectRepository.save(project);
        return ProjectMapper.toResponse(updated);
    }

    public void deleteProject(UUID id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        projectRepository.delete(project);
    }
}
