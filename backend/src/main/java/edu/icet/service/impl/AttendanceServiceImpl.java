package edu.icet.service.impl;

import edu.icet.dto.Attendance;
import edu.icet.dto.Class;
import edu.icet.dto.Student;
import edu.icet.repository.AttendanceRepository;
import edu.icet.repository.ClassRepository;
import edu.icet.repository.StudentRepository;
import edu.icet.service.AttendanceService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final ClassRepository classRepository;
    private final StudentRepository studentRepository;

    @Override
    public List<Attendance> findAllAttendance() {
        return attendanceRepository.findAll();
    }

    @Override
    public Attendance findById(Integer id) {
        return attendanceRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Attendance record not found with id: " + id));
    }

    @Override
    public Attendance createAttendance(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    @Override
    public Attendance updateAttendance(Attendance attendance) {
        return attendanceRepository.save(attendance);
    }

    @Override
    public void deleteAttendance(Integer id) {
        attendanceRepository.deleteById(id);
    }

    @Override
    public List<Attendance> findAttendanceByStudentId(Integer studentId) {
        return attendanceRepository.findByStudentId(studentId);
    }

    @Override
    public List<Attendance> findAttendanceByClassId(Integer classId) {
        return attendanceRepository.findByClassAttendedId(classId);
    }

    @Override
    public List<Attendance> findAttendanceByStudentAndClass(Integer studentId, Integer classId) {
        return attendanceRepository.findByStudentIdAndClassAttendedId(studentId, classId);
    }

    @Override
    public List<Attendance> findAttendanceByDate(Date date) {
        return attendanceRepository.findByDate(date);
    }

    @Override
    public List<Attendance> findAttendanceByClassAndDate(Integer classId, Date date) {
        return attendanceRepository.findByClassAttendedIdAndDate(classId, date);
    }

    @Override
    public void markAttendance(Integer classId, Date date, Map<Integer, Boolean> studentAttendance) {
        Class classObj = classRepository.findById(classId)
            .orElseThrow(() -> new EntityNotFoundException("Class not found with id: " + classId));
        
        // Delete existing attendance records for this class and date to avoid duplicates
        List<Attendance> existingRecords = attendanceRepository.findByClassAttendedIdAndDate(classId, date);
        attendanceRepository.deleteAll(existingRecords);
        
        // Create new attendance records
        List<Attendance> attendanceRecords = new ArrayList<>();
        
        for (Map.Entry<Integer, Boolean> entry : studentAttendance.entrySet()) {
            Integer studentId = entry.getKey();
            Boolean present = entry.getValue();
            
            Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + studentId));
            
            Attendance attendance = new Attendance();
            attendance.setStudent(student);
            attendance.setClassAttended(classObj);
            attendance.setDate(date);
            attendance.setPresent(present);
            
            attendanceRecords.add(attendance);
        }
        
        attendanceRepository.saveAll(attendanceRecords);
    }

    @Override
    public Map<Integer, Double> getAttendancePercentageByClass(Integer studentId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + studentId));
        
        // Get all classes the student is enrolled in
        Set<Class> enrolledClasses = student.getClasses();
        
        Map<Integer, Double> percentages = new HashMap<>();
        
        for (Class classObj : enrolledClasses) {
            Integer classId = classObj.getId();
            
            // Get attendance counts
            Long present = attendanceRepository.countPresentByStudentIdAndClassId(studentId, classId);
            Long total = attendanceRepository.countTotalByStudentIdAndClassId(studentId, classId);
            
            // Calculate percentage
            Double percentage = (total > 0) ? (present * 100.0 / total) : 0.0;
            percentages.put(classId, percentage);
        }
        
        return percentages;
    }
}
