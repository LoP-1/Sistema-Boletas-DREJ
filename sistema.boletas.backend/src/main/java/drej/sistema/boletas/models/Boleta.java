package drej.sistema.boletas.models;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "boleta")
public class Boleta {
//coment
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String archivoOrigen;
    private Integer rawLength;
    private String secuencia;
    private String codigoEncabezado;
    private String rucBloque;
    private String mes;
    private String anio;
    private String estado;
    private String establecimiento;
    private String cargo;
    private String tipoServidor;
    private String nivelMagHoras;
    private String tiempoServicio;
    private String leyendaPermanente;
    private String fechaIngresoRegistro;
    private String fechaTerminoRegistro;
    private String cuentaPrincipal;

    @ElementCollection
    @CollectionTable(name = "boleta_cuentas", joinColumns = @JoinColumn(name = "boleta_id"))
    @Column(name = "cuenta")
    private List<String> cuentasTodas;

    @Embedded
    private RegPensionarioDetalle regPensionarioDetalle;

    private Double totalRemuneraciones;
    private Double totalDescuentos;
    private Double totalLiquido;
    private Double montoImponible;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "persona_id")
    private Persona persona;

    @OneToMany(mappedBy = "boleta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Concepto> conceptos;
}
