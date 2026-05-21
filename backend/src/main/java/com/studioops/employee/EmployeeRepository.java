package com.studioops.employee;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Optional<Employee> findByEmail(String email);

    @Query("SELECT e FROM Employee e WHERE " +
           "LOWER(e.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.phone) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.primaryRole) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.skills) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Employee> searchEmployees(@Param("search") String search);
}
