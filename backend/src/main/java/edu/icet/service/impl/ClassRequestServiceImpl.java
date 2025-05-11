package edu.icet.service.impl;

import edu.icet.dto.Class;
import edu.icet.dto.ClassRequest;
import edu.icet.dto.Student;
import edu.icet.repository.ClassRepository;
import edu.icet.repository.ClassRequestRepository;
import edu.icet.repository.StudentRepository;
import edu.icet.service.ClassRequestService;
import edu.icet.service.ClassService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassRequestServiceImpl implements ClassRequestService {
    
    private final ClassRequestRepository classRequestRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;
    private final ClassService classService;
    
    @Override
    public List<ClassRequest> findAllRequests() {
        return classRequestRepository.findAll();
    }
    
    @Override
    public ClassRequest findById(Integer id) {
        return classRequestRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Class request not found with id: " + id));
    }
    
    @Override
    public ClassRequest createRequest(Integer studentId, Integer classId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + studentId));
        
        Class classObj = classRepository.findById(classId)
            .orElseThrow(() -> new EntityNotFoundException("Class not found with id: " + classId));
        
        // Check if there's already a pending request
        if (hasExistingRequest(studentId, classId)) {
            throw new IllegalStateException("A request for this class already exists");
        }
        
        ClassRequest request = new ClassRequest();
        request.setStudent(student);
        request.setRequestedClass(classObj);
        request.setRequestDate(new Date());
        request.setStatus("PENDING");
        
        return classRequestRepository.save(request);
    }
    
    @Override
    public ClassRequest approveRequest(Integer requestId, String notes) {
        ClassRequest request = findById(requestId);
        request.setStatus("APPROVED");
        request.setResponseDate(new Date());
        request.setResponseNotes(notes);
        
        // Add student to class
        classService.addStudentToClass(request.getRequestedClass().getId(), request.getStudent().getId());
        
        return classRequestRepository.save(request);
    }
    
    @Override
    public ClassRequest rejectRequest(Integer requestId, String notes) {
        ClassRequest request = findById(requestId);
        request.setStatus("REJECTED");
        request.setResponseDate(new Date());
        request.setResponseNotes(notes);
        
        return classRequestRepository.save(request);
    }
    
    @Override
    public List<ClassRequest> findRequestsByStudentId(Integer studentId) {
        return classRequestRepository.findByStudentId(studentId);
    }
    
    @Override
    public List<ClassRequest> findRequestsByClassId(Integer classId) {
        return classRequestRepository.findByRequestedClassId(classId);
    }
    
    @Override
    public List<ClassRequest> findPendingRequests() {
        return classRequestRepository.findByStatus("PENDING");
    }
    
    @Override
    public boolean hasExistingRequest(Integer studentId, Integer classId) {
        List<ClassRequest> requests = classRequestRepository
            .findByStudentIdAndRequestedClassId(studentId, classId);
        
        return requests.stream()
            .anyMatch(r -> r.getStatus().equals("PENDING"));
    }
}
