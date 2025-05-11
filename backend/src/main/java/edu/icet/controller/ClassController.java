package edu.icet.controller;

import edu.icet.dto.Class;
import edu.icet.dto.Student;
import edu.icet.service.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@CrossOrigin
@RequestMapping("/classes")
@RequiredArgsConstructor
public class ClassController {

    private final ClassService classService;

    @GetMapping
    public List<Class> getAllClasses() {
        return classService.findAllClasses();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Class> getClassById(@PathVariable Integer id) {
        try {
            Class classObj = classService.findById(id);
            return ResponseEntity.ok(classObj);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Class> createClass(@RequestBody Class classObj) {
        Class createdClass = classService.createClass(classObj);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdClass);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Class> updateClass(@PathVariable Integer id, @RequestBody Class classObj) {
        if (!id.equals(classObj.getId())) {
            return ResponseEntity.badRequest().build();
        }
        Class updatedClass = classService.updateClass(classObj);
        return ResponseEntity.ok(updatedClass);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClass(@PathVariable Integer id) {
        try {
            classService.deleteClass(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/student/{studentId}")
    public List<Class> getClassesByStudentId(@PathVariable Integer studentId) {
        return classService.findClassesByStudentId(studentId);
    }

    @GetMapping("/student/{studentId}/available")
    public List<Class> getAvailableClassesForStudent(@PathVariable Integer studentId) {
        return classService.findClassesNotEnrolledByStudent(studentId);
    }

    @PostMapping("/{classId}/students/{studentId}")
    public ResponseEntity<Class> addStudentToClass(@PathVariable Integer classId, @PathVariable Integer studentId) {
        try {
            Class updatedClass = classService.addStudentToClass(classId, studentId);
            return ResponseEntity.ok(updatedClass);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @DeleteMapping("/{classId}/students/{studentId}")
    public ResponseEntity<Class> removeStudentFromClass(@PathVariable Integer classId, @PathVariable Integer studentId) {
        try {
            Class updatedClass = classService.removeStudentFromClass(classId, studentId);
            return ResponseEntity.ok(updatedClass);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/{classId}/students")
    public ResponseEntity<Set<Student>> getEnrolledStudents(@PathVariable Integer classId) {
        try {
            Set<Student> students = classService.getEnrolledStudents(classId);
            return ResponseEntity.ok(students);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
