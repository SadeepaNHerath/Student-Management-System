package edu.icet.service.impl;

import edu.icet.dto.Class;
import edu.icet.dto.Student;
import edu.icet.repository.ClassRepository;
import edu.icet.repository.StudentRepository;
import edu.icet.service.ClassService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClassServiceImpl implements ClassService {
    
    private final ClassRepository classRepository;
    private final StudentRepository studentRepository;
    
    @Override
    public List<Class> findAllClasses() {
        return classRepository.findAll();
    }
    
    @Override
    public Class findById(Integer id) {
        return classRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Class not found with id: " + id));
    }
    
    @Override
    public Class createClass(Class classObj) {
        return classRepository.save(classObj);
    }
    
    @Override
    public Class updateClass(Class classObj) {
        return classRepository.save(classObj);
    }
    
    @Override
    public void deleteClass(Integer id) {
        classRepository.deleteById(id);
    }
    
    @Override
    public List<Class> findClassesByStudentId(Integer studentId) {
        return classRepository.findByStudentsId(studentId);
    }
    
    @Override
    public List<Class> findClassesNotEnrolledByStudent(Integer studentId) {
        List<Class> allClasses = classRepository.findAll();
        List<Class> enrolledClasses = classRepository.findByStudentsId(studentId);
        
        return allClasses.stream()
            .filter(c -> !enrolledClasses.contains(c))
            .collect(Collectors.toList());
    }
    
    @Override
    public Class addStudentToClass(Integer classId, Integer studentId) {
        Class classObj = findById(classId);
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + studentId));
        
        classObj.getStudents().add(student);
        return classRepository.save(classObj);
    }
    
    @Override
    public Class removeStudentFromClass(Integer classId, Integer studentId) {
        Class classObj = findById(classId);
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new EntityNotFoundException("Student not found with id: " + studentId));
        
        classObj.getStudents().remove(student);
        return classRepository.save(classObj);
    }
    
    @Override
    public Set<Student> getEnrolledStudents(Integer classId) {
        Class classObj = findById(classId);
        return classObj.getStudents();
    }
}
