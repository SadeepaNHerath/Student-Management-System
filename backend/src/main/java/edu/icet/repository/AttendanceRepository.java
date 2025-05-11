package edu.icet.repository;

import edu.icet.dto.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {
    List<Attendance> findByStudentId(Integer studentId);

    List<Attendance> findByClassAttendedId(Integer classId);

    List<Attendance> findByStudentIdAndClassAttendedId(Integer studentId, Integer classId);

    List<Attendance> findByDate(Date date);

    List<Attendance> findByClassAttendedIdAndDate(Integer classId, Date date);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = ?1 AND a.classAttended.id = ?2 AND a.present = true")
    Long countPresentByStudentIdAndClassId(Integer studentId, Integer classId);

    @Query("SELECT COUNT(a) FROM Attendance a WHERE a.student.id = ?1 AND a.classAttended.id = ?2")
    Long countTotalByStudentIdAndClassId(Integer studentId, Integer classId);
}
