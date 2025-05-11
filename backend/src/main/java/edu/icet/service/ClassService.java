package edu.icet.service;

import edu.icet.dto.Class;
import edu.icet.dto.Student;

import java.util.List;
import java.util.Set;

public interface ClassService {
    List<Class> findAllClasses();

    Class findById(Integer id);

    Class createClass(Class classObj);

    Class updateClass(Class classObj);

    void deleteClass(Integer id);

    List<Class> findClassesByStudentId(Integer studentId);

    List<Class> findClassesNotEnrolledByStudent(Integer studentId);

    Class addStudentToClass(Integer classId, Integer studentId);

    Class removeStudentFromClass(Integer classId, Integer studentId);

    Set<Student> getEnrolledStudents(Integer classId);
}
