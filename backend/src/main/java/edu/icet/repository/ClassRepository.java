package edu.icet.repository;

import edu.icet.dto.Class;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassRepository extends JpaRepository<Class, Integer> {
    List<Class> findByStudentsId(Integer studentId);
}
