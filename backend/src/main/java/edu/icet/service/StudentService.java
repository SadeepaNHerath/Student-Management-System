package edu.icet.service;

import java.io.IOException;
import java.util.List;
import edu.icet.dto.Student;

public interface StudentService {
    List<Student> findAllStudents();
    void addStudent(Student student) throws IOException;
    Student searchStudentById(Integer id);
    void updateStudent(Student student) throws IOException;
    void deleteStudentById(Integer id);
}
