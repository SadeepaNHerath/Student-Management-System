package edu.icet.repository;

import edu.icet.dto.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    @Override
    @NonNull
    Optional<Student> findById(@NonNull Integer id);
}
