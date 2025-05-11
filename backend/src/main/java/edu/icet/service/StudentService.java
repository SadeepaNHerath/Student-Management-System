package edu.icet.service;

import edu.icet.dto.Student;

import java.io.IOException;
import java.util.List;

public interface StudentService {
    List<Student> findAllStudents();

    void addStudent(Student student) throws IOException;

    Student searchStudentById(Integer id);

    void updateStudent(Student student) throws IOException;

    void deleteStudentById(Integer id);
}
