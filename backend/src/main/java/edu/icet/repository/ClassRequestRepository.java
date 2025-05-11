package edu.icet.repository;

import edu.icet.dto.ClassRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassRequestRepository extends JpaRepository<ClassRequest, Integer> {
    List<ClassRequest> findByStudentId(Integer studentId);

    List<ClassRequest> findByRequestedClassId(Integer classId);

    List<ClassRequest> findByStatus(String status);

    List<ClassRequest> findByStudentIdAndRequestedClassId(Integer studentId, Integer classId);
}
