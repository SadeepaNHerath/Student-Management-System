package edu.icet.controller;

import edu.icet.dto.ClassRequest;
import edu.icet.service.ClassRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/requests")
@RequiredArgsConstructor
public class ClassRequestController {

    private final ClassRequestService classRequestService;

    @GetMapping
    public List<ClassRequest> getAllRequests() {
        return classRequestService.findAllRequests();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassRequest> getRequestById(@PathVariable Integer id) {
        try {
            ClassRequest request = classRequestService.findById(id);
            return ResponseEntity.ok(request);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createRequest(@RequestBody Map<String, Integer> requestData) {
        try {
            Integer studentId = requestData.get("studentId");
            Integer classId = requestData.get("classId");

            if (studentId == null || classId == null) {
                return ResponseEntity.badRequest().body("Student ID and Class ID are required");
            }

            if (classRequestService.hasExistingRequest(studentId, classId)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("A pending request for this class already exists");
            }

            ClassRequest createdRequest = classRequestService.createRequest(studentId, classId);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{requestId}/approve")
    public ResponseEntity<ClassRequest> approveRequest(
            @PathVariable Integer requestId,
            @RequestBody(required = false) Map<String, String> notes) {
        try {
            String responseNotes = notes != null ? notes.get("notes") : "";
            ClassRequest updatedRequest = classRequestService.approveRequest(requestId, responseNotes);
            return ResponseEntity.ok(updatedRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{requestId}/reject")
    public ResponseEntity<ClassRequest> rejectRequest(
            @PathVariable Integer requestId,
            @RequestBody(required = false) Map<String, String> notes) {
        try {
            String responseNotes = notes != null ? notes.get("notes") : "";
            ClassRequest updatedRequest = classRequestService.rejectRequest(requestId, responseNotes);
            return ResponseEntity.ok(updatedRequest);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/student/{studentId}")
    public List<ClassRequest> getRequestsByStudentId(@PathVariable Integer studentId) {
        return classRequestService.findRequestsByStudentId(studentId);
    }

    @GetMapping("/class/{classId}")
    public List<ClassRequest> getRequestsByClassId(@PathVariable Integer classId) {
        return classRequestService.findRequestsByClassId(classId);
    }

    @GetMapping("/pending")
    public List<ClassRequest> getPendingRequests() {
        return classRequestService.findPendingRequests();
    }
}
