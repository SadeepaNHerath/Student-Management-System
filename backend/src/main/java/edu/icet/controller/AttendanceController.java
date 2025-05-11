package edu.icet.controller;

import edu.icet.dto.Attendance;
import edu.icet.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin
@RequestMapping("/attendance")
public class AttendanceController {
    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public List<Attendance> getAllAttendance() {
        return attendanceService.findAllAttendance();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Attendance> getAttendanceById(@PathVariable Integer id) {
        try {
            Attendance attendance = attendanceService.findById(id);
            return ResponseEntity.ok(attendance);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Attendance> createAttendance(@RequestBody Attendance attendance) {
        try {
            Attendance createdAttendance = attendanceService.createAttendance(attendance);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAttendance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Attendance> updateAttendance(@PathVariable Integer id, @RequestBody Attendance attendance) {
        try {
            Attendance updatedAttendance = attendanceService.updateAttendance(attendance);
            return ResponseEntity.ok(updatedAttendance);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Integer id) {
        try {
            attendanceService.deleteAttendance(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/student/{studentId}")
    public List<Attendance> getAttendanceByStudentId(@PathVariable Integer studentId) {
        return attendanceService.findAttendanceByStudentId(studentId);
    }

    @GetMapping("/class/{classId}")
    public List<Attendance> getAttendanceByClassId(@PathVariable Integer classId) {
        return attendanceService.findAttendanceByClassId(classId);
    }

    @GetMapping("/student/{studentId}/class/{classId}")
    public List<Attendance> getAttendanceByStudentAndClass(
            @PathVariable Integer studentId,
            @PathVariable Integer classId) {
        return attendanceService.findAttendanceByStudentAndClass(studentId, classId);
    }

    @GetMapping("/date")
    public List<Attendance> getAttendanceByDate(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date date) {
        return attendanceService.findAttendanceByDate(date);
    }

    @GetMapping("/class/{classId}/date")
    public List<Attendance> getAttendanceByClassAndDate(
            @PathVariable Integer classId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date date) {
        return attendanceService.findAttendanceByClassAndDate(classId, date);
    }

    @PostMapping("/mark")
    public ResponseEntity<String> markAttendance(
            @RequestBody Map<String, Object> attendanceData) {
        try {
            Integer classId = (Integer) attendanceData.get("classId");
            String dateStr = (String) attendanceData.get("date");

            if (classId == null || dateStr == null) {
                return ResponseEntity.badRequest().body("Class ID and date are required");
            }
            @SuppressWarnings("unchecked")
            Map<String, Boolean> rawStudentAttendance = (Map<String, Boolean>) attendanceData.get("studentAttendance");
            if (rawStudentAttendance == null) {
                return ResponseEntity.badRequest().body("Student attendance data is required");
            }

            // Convert string keys to Integer
            Map<Integer, Boolean> studentAttendance = rawStudentAttendance.entrySet().stream()
                    .collect(
                            java.util.stream.Collectors.toMap(
                                    e -> Integer.valueOf(e.getKey()),
                                    Map.Entry::getValue
                            )
                    );
            // Convert string to Date directly
            Date date = java.sql.Date.valueOf(dateStr);
            attendanceService.markAttendance(classId, date, studentAttendance);
            return ResponseEntity.ok("Attendance marked successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error marking attendance: " + e.getMessage());
        }
    }

    @GetMapping("/student/{studentId}/percentage")
    public ResponseEntity<Map<Integer, Double>> getAttendancePercentageByClass(@PathVariable Integer studentId) {
        try {
            Map<Integer, Double> percentages = attendanceService.getAttendancePercentageByClass(studentId);
            return ResponseEntity.ok(percentages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
