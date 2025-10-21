package drej.sistema.boletas.config;

import drej.sistema.boletas.models.Usuario;
import drej.sistema.boletas.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UsuarioRepository usuarioRepository) {
        this.jwtUtil = jwtUtil;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String header = request.getHeader(jwtUtil.getAuthorizationHeaderName());
        if (header != null && header.startsWith(jwtUtil.getTokenPrefix() + " ")) {
            String token = header;
            if (jwtUtil.validateToken(token)) {
                String correo = jwtUtil.extractCorreo(token);
                String rol = jwtUtil.extractRol(token);

                Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(correo);

                if (usuarioOpt.isPresent()) {
                    // Puedes agregar más authorities según los roles de tu app
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    usuarioOpt.get(),
                                    null,
                                    Collections.singleton(new SimpleGrantedAuthority("ROLE_" + rol))
                            );
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}