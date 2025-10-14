package drej.sistema.boletas.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "boleta")
public class Boleta {

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

    // Puede venir en boletas de cesantes/jubilados
    private String tipoServidor;
    private String tipoPensionista;
    private String tipoPension;

    private String nivelMagHoras;
    private String tiempoServicio;

    private String leyendaPermanente;
    private String leyendaMensual;

    private String fechaIngresoRegistro;
    private String fechaTerminoRegistro;
    private String cuentaPrincipal;

    @ElementCollection
    @CollectionTable(name = "boleta_cuentas", joinColumns = @JoinColumn(name = "boleta_id"))
    @Column(name = "cuenta")
    private List<String> cuentasTodas;

    @Embedded
    private RegPensionarioDetalle regPensionarioDetalle;

    private String regimenPensionario; // Campo para Ley 19990, etc.

    private Double totalRemuneraciones;
    private Double totalDescuentos;
    private Double totalLiquido;
    private Double montoImponible;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "persona_id")
    @JsonBackReference
    private Persona persona;

    @OneToMany(mappedBy = "boleta", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Concepto> conceptos;


    //getters y setters


    public String getTipoPensionista() {
        return tipoPensionista;
    }

    public void setTipoPensionista(String tipoPensionista) {
        this.tipoPensionista = tipoPensionista;
    }

    public String getTipoPension() {
        return tipoPension;
    }

    public void setTipoPension(String tipoPension) {
        this.tipoPension = tipoPension;
    }

    public String getLeyendaMensual() {
        return leyendaMensual;
    }

    public void setLeyendaMensual(String leyendaMensual) {
        this.leyendaMensual = leyendaMensual;
    }

    public String getRegimenPensionario() {
        return regimenPensionario;
    }

    public void setRegimenPensionario(String regimenPensionario) {
        this.regimenPensionario = regimenPensionario;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getArchivoOrigen() {
        return archivoOrigen;
    }

    public void setArchivoOrigen(String archivoOrigen) {
        this.archivoOrigen = archivoOrigen;
    }

    public Integer getRawLength() {
        return rawLength;
    }

    public void setRawLength(Integer rawLength) {
        this.rawLength = rawLength;
    }

    public String getSecuencia() {
        return secuencia;
    }

    public void setSecuencia(String secuencia) {
        this.secuencia = secuencia;
    }

    public String getCodigoEncabezado() {
        return codigoEncabezado;
    }

    public void setCodigoEncabezado(String codigoEncabezado) {
        this.codigoEncabezado = codigoEncabezado;
    }

    public String getRucBloque() {
        return rucBloque;
    }

    public void setRucBloque(String rucBloque) {
        this.rucBloque = rucBloque;
    }

    public String getMes() {
        return mes;
    }

    public void setMes(String mes) {
        this.mes = mes;
    }

    public String getAnio() {
        return anio;
    }

    public void setAnio(String anio) {
        this.anio = anio;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getEstablecimiento() {
        return establecimiento;
    }

    public void setEstablecimiento(String establecimiento) {
        this.establecimiento = establecimiento;
    }

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    public String getTipoServidor() {
        return tipoServidor;
    }

    public void setTipoServidor(String tipoServidor) {
        this.tipoServidor = tipoServidor;
    }

    public String getNivelMagHoras() {
        return nivelMagHoras;
    }

    public void setNivelMagHoras(String nivelMagHoras) {
        this.nivelMagHoras = nivelMagHoras;
    }

    public String getTiempoServicio() {
        return tiempoServicio;
    }

    public void setTiempoServicio(String tiempoServicio) {
        this.tiempoServicio = tiempoServicio;
    }

    public String getLeyendaPermanente() {
        return leyendaPermanente;
    }

    public void setLeyendaPermanente(String leyendaPermanente) {
        this.leyendaPermanente = leyendaPermanente;
    }

    public String getFechaIngresoRegistro() {
        return fechaIngresoRegistro;
    }

    public void setFechaIngresoRegistro(String fechaIngresoRegistro) {
        this.fechaIngresoRegistro = fechaIngresoRegistro;
    }

    public String getFechaTerminoRegistro() {
        return fechaTerminoRegistro;
    }

    public void setFechaTerminoRegistro(String fechaTerminoRegistro) {
        this.fechaTerminoRegistro = fechaTerminoRegistro;
    }

    public String getCuentaPrincipal() {
        return cuentaPrincipal;
    }

    public void setCuentaPrincipal(String cuentaPrincipal) {
        this.cuentaPrincipal = cuentaPrincipal;
    }

    public List<String> getCuentasTodas() {
        return cuentasTodas;
    }

    public void setCuentasTodas(List<String> cuentasTodas) {
        this.cuentasTodas = cuentasTodas;
    }

    public RegPensionarioDetalle getRegPensionarioDetalle() {
        return regPensionarioDetalle;
    }

    public void setRegPensionarioDetalle(RegPensionarioDetalle regPensionarioDetalle) {
        this.regPensionarioDetalle = regPensionarioDetalle;
    }

    public Double getTotalRemuneraciones() {
        return totalRemuneraciones;
    }

    public void setTotalRemuneraciones(Double totalRemuneraciones) {
        this.totalRemuneraciones = totalRemuneraciones;
    }

    public Double getTotalDescuentos() {
        return totalDescuentos;
    }

    public void setTotalDescuentos(Double totalDescuentos) {
        this.totalDescuentos = totalDescuentos;
    }

    public Double getTotalLiquido() {
        return totalLiquido;
    }

    public void setTotalLiquido(Double totalLiquido) {
        this.totalLiquido = totalLiquido;
    }

    public Double getMontoImponible() {
        return montoImponible;
    }

    public void setMontoImponible(Double montoImponible) {
        this.montoImponible = montoImponible;
    }

    public Persona getPersona() {
        return persona;
    }

    public void setPersona(Persona persona) {
        this.persona = persona;
    }

    public List<Concepto> getConceptos() {
        return conceptos;
    }

    public void setConceptos(List<Concepto> conceptos) {
        this.conceptos = conceptos;
    }
}
