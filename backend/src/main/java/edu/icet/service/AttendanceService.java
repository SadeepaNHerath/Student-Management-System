package edu.icet.service;

import edu.icet.dto.Attendance;
import java.util.Date;
import java.util.List;
import java.util.Map;

public interface AttendanceService {
    List<Attendance> findAllAttendance();
    Attendance findById(Integer id);
    Attendance createAttendance(Attendance attendance);
    Attendance updateAttendance(Attendance attendance);
    void deleteAttendance(Integer id);
    List<Attendance> findAttendanceByStudentId(Integer studentId);
    List<Attendance> findAttendanceByClassId(Integer classId);
    List<Attendance> findAttendanceByStudentAndClass(Integer studentId, Integer classId);
    List<Attendance> findAttendanceByDate(Date date);
    List<Attendance> findAttendanceByClassAndDate(Integer classId, Date date);
    void markAttendance(Integer classId, Date date, Map<Integer, Boolean> studentAttendance);
    Map<Integer, Double> getAttendancePercentageByClass(Integer studentId);
}
