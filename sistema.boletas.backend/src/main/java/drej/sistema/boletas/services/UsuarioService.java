package drej.sistema.boletas.services;

import drej.sistema.boletas.models.Persona;
import drej.sistema.boletas.models.Usuario;
import drej.sistema.boletas.repository.PersonaRepository;
import drej.sistema.boletas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    @Autowired
    private PersonaRepository personaRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public Usuario registrarUsuario(Usuario usuario) {
        Optional<Persona> personaOpt = personaRepository.findByDocumentoIdentidad(usuario.getDni());

        if (personaOpt.isEmpty()) {
            Persona nuevaPersona = new Persona();
            nuevaPersona.setNombres(usuario.getNombre());
            nuevaPersona.setApellidos(usuario.getApellido());
            nuevaPersona.setDocumentoIdentidad(usuario.getDni());

            personaRepository.save(nuevaPersona);
        }
        usuario.setContrasena(passwordEncoder.encode(usuario.getContrasena()));
        usuario.setEstadoCuenta(false);
        return usuarioRepository.save(usuario);
    }

    public Optional<Usuario> buscarPorCorreo(String correo) {
        return usuarioRepository.findByCorreo(correo);
    }

    public Usuario actualizarEstado(Long id, boolean nuevoEstado) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow();
        usuario.setEstadoCuenta(nuevoEstado);
        return usuarioRepository.save(usuario);
    }

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario actualizarDatos(Long id, Usuario datosActualizados) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow();
        usuario.setNombre(datosActualizados.getNombre());
        usuario.setApellido(datosActualizados.getApellido());
        usuario.setCorreo(datosActualizados.getCorreo());
        usuario.setDni(datosActualizados.getDni());
        usuario.setTelefono(datosActualizados.getTelefono());
        usuario.setRol(datosActualizados.getRol());
        // No actualices la contraseña ni estado aquí
        return usuarioRepository.save(usuario);
    }

    public void eliminarUsuario(Long id) {
        usuarioRepository.deleteById(id);
    }

    public void cambiarContrasena(Long id, String nuevaContrasena) {
        Usuario usuario = usuarioRepository.findById(id).orElseThrow();
        usuario.setContrasena(passwordEncoder.encode(nuevaContrasena));
        usuarioRepository.save(usuario);
    }

    public Optional<Usuario> buscarPorId(Long id) {
        return usuarioRepository.findById(id);
    }
}
