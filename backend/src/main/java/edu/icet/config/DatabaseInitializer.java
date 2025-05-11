package edu.icet.config;

import edu.icet.dto.Class;
import edu.icet.dto.Student;
import edu.icet.dto.User;
import edu.icet.repository.ClassRepository;
import edu.icet.repository.StudentRepository;
import edu.icet.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.lang.reflect.Field;
import java.util.Date;
import java.util.HashSet;
import java.util.Optional;

@Configuration
@Profile("!test")
public class DatabaseInitializer {
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final ClassRepository classRepository;

    @Autowired
    public DatabaseInitializer(UserRepository userRepository, StudentRepository studentRepository, ClassRepository classRepository) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.classRepository = classRepository;
    }

    @PostConstruct
    public void init() {
        Optional<User> adminOptional = userRepository.findByUsername("admin");
        if (adminOptional.isEmpty()) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword("admin123");
            admin.setRole("ADMIN");
            userRepository.save(admin);
        }

        // Create some initial students
        createStudentIfNotExists("STU001", "John", "Doe", "123 Student Lane", new Date(), "997654321V", "0771234567");
        createStudentIfNotExists("STU002", "Jane", "Smith", "456 College Road", new Date(), "986543219V", "0772345678");
        createStudentIfNotExists("STU003", "Robert", "Johnson", "789 University Ave", new Date(), "975432198V", "0773456789");

        // Create some initial classes
        createClassIfNotExists("CLS001", "Web Development", "HTML, CSS, JavaScript fundamentals", "Mon, Wed 10:00-12:00");
        createClassIfNotExists("CLS002", "Java Programming", "Core Java and object-oriented principles", "Tue, Thu 14:00-16:00");
        createClassIfNotExists("CLS003", "Database Design", "SQL and database principles", "Fri 09:00-13:00");
        createClassIfNotExists("CLS004", "Mobile App Development", "Android and iOS development", "Mon, Wed 14:00-16:00");
    }

    private void createStudentIfNotExists(String id, String firstName, String lastName, String address, Date dob, String nic, String contact) {
        int studentId = Integer.parseInt(id.substring(3));

        // First check if user with this username already exists
        Optional<User> existingUser = userRepository.findByUsername(id);
        if (existingUser.isPresent()) {
            // User already exists, skip creation
            return;
        }

        // Check if student exists
        Optional<Student> existingStudent = studentRepository.findById(studentId);

        if (existingStudent.isEmpty()) {
            Student student = new Student();
            student.setId(studentId);
            student.setFName(firstName);
            student.setLName(lastName);
            student.setAddress(address);
            student.setDob(dob);
            student.setNic(nic);
            student.setContact(contact);
            student.setClasses(new HashSet<>());

            student = studentRepository.save(student);

            // Create user account for student
            User user = new User();
            user.setUsername(id);
            user.setPassword("student123");
            user.setRole("STUDENT");
            user.setStudent(student);
            userRepository.save(user);
        }
    }

    private void createClassIfNotExists(String id, String name, String description, String schedule) {
        int classId = Integer.parseInt(id.substring(3));
        Optional<Class> existingClass = classRepository.findById(classId);

        if (existingClass.isEmpty()) {
            Class classObj = new Class();
            setFieldValue(classObj, "id", classId);
            setFieldValue(classObj, "name", name);
            setFieldValue(classObj, "description", description);
            setFieldValue(classObj, "schedule", schedule);

            // Set dates for demo
            Date now = new Date();
            setFieldValue(classObj, "startDate", new Date(now.getTime() - 30L * 24 * 60 * 60 * 1000)); // 30 days ago
            setFieldValue(classObj, "endDate", new Date(now.getTime() + 90L * 24 * 60 * 60 * 1000));  // 90 days from now
            setFieldValue(classObj, "students", new HashSet<>());

            classRepository.save(classObj);
        }
    }

    // Helper method to set field values using reflection
    private void setFieldValue(Object obj, String fieldName, Object value) {
        try {
            Field field = findField(obj.getClass(), fieldName);
            if (field != null) {
                field.setAccessible(true);
                field.set(obj, value);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error setting field " + fieldName, e);
        }
    }

    // Helper method to find a field in a class or its superclasses
    private Field findField(java.lang.Class<?> clazz, String fieldName) {
        java.lang.Class<?> currentClass = clazz;
        while (currentClass != null) {
            try {
                return currentClass.getDeclaredField(fieldName);
            } catch (NoSuchFieldException e) {
                currentClass = currentClass.getSuperclass();
            }
        }
        return null;
    }
}
