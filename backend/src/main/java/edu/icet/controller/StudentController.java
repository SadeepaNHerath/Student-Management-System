package edu.icet.controller;

import edu.icet.dto.Student;
import edu.icet.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@CrossOrigin
@RequestMapping("/student")
@RequiredArgsConstructor
public class StudentController {
    final StudentService service;

    @GetMapping("/students")
    public List<Student> getAllStudents() {
        return service.findAllStudents();
    }

    @PostMapping("/students")
    public void addStudent(@RequestPart("student") Student student, @RequestPart("profilePic") MultipartFile file) throws IOException {
        student.setProfilePic(file.getBytes());
        service.addStudent(student);
    }

    @GetMapping("/students/{id}")
    public Student getStudentById(@PathVariable Integer id) {
        return service.searchStudentById(id);
    }

    @PatchMapping("/students")
    public void updateStudent(@RequestPart("student") Student student, @RequestPart("profilePicture") MultipartFile file) throws IOException {
        student.setProfilePic(file.getBytes());
        service.updateStudent(student);
    }

    @DeleteMapping("/students/{id}")
    public void deleteStudent(@PathVariable Integer id) {
        service.deleteStudentById(id);
    }

}
