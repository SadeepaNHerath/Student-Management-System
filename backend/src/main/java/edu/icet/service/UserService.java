package edu.icet.service;

import edu.icet.dto.User;
import java.util.List;
import java.util.Optional;

public interface UserService {
    List<User> findAllUsers();
    User findById(Integer id);
    Optional<User> findByUsername(String username);
    Optional<User> findByStudentId(Integer studentId);
    User createUser(User user);
    User updateUser(User user);
    void deleteUser(Integer id);
    boolean authenticate(String username, String password);
}
