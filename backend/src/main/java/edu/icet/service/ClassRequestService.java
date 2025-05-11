package edu.icet.service;

import edu.icet.dto.ClassRequest;
import java.util.Date;
import java.util.List;

public interface ClassRequestService {
    List<ClassRequest> findAllRequests();
    ClassRequest findById(Integer id);
    ClassRequest createRequest(Integer studentId, Integer classId);
    ClassRequest approveRequest(Integer requestId, String notes);
    ClassRequest rejectRequest(Integer requestId, String notes);
    List<ClassRequest> findRequestsByStudentId(Integer studentId);
    List<ClassRequest> findRequestsByClassId(Integer classId);
    List<ClassRequest> findPendingRequests();
    boolean hasExistingRequest(Integer studentId, Integer classId);
}
