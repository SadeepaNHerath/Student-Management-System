package edu.icet.dto;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "Student")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;
    
    @Column(name = "f_name")
    private String fName;
    
    @Column(name = "l_name")
    private String lName;
    
    private String address;
    private Date dob;
    private String nic;
    private String contact;

    @Lob
    @Column(name = "profilePic", columnDefinition = "LONGBLOB")
    private byte[] profilePic;
    
    @ManyToMany(mappedBy = "students")
    private Set<Class> classes = new HashSet<>();
}
