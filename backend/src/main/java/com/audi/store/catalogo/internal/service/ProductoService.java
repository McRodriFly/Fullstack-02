package com.audi.store.catalogo.internal.service;

import com.audi.store.catalogo.internal.domain.Producto;
import com.audi.store.catalogo.internal.repository.ProductoRepository;
import com.audi.store.shared.error.ConflictoException;
import com.audi.store.shared.error.RecursoNoEncontradoException;
import com.audi.store.shared.error.SolicitudInvalidaException;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaService categoriaService;

    /** Lista todo el catálogo o, si se indica {@code categoriaId}, solo esa categoría. */
    public List<Producto> listar(Long categoriaId) {
        return categoriaId == null
                ? productoRepository.findAllByOrderByIdAsc()
                : productoRepository.findByCategoriaIdOrderByIdAsc(categoriaId);
    }

    /** @throws RecursoNoEncontradoException si el producto no existe */
    public Producto obtener(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("El producto " + id + " no existe"));
    }

    /**
     * @throws RecursoNoEncontradoException si la categoría no existe
     * @throws SolicitudInvalidaException   si los montos o el stock no son válidos
     */
    @Transactional
    public Producto crear(DatosProducto datos) {
        Producto producto = new Producto();
        aplicar(producto, datos);
        return productoRepository.save(producto);
    }

    /**
     * Reemplaza todos los datos del producto.
     *
     * @throws RecursoNoEncontradoException si el producto o la categoría no existen
     * @throws SolicitudInvalidaException   si los montos o el stock no son válidos
     */
    @Transactional
    public Producto actualizar(Long id, DatosProducto datos) {
        Producto producto = obtener(id);
        aplicar(producto, datos);
        return producto;
    }

    /**
     * Elimina un producto que nunca se ha vendido. Las boletas son de otro módulo, así que la
     * comprobación la hace la clave foránea {@code fk_detalles_producto} de la base de datos.
     *
     * @throws RecursoNoEncontradoException si el producto no existe
     * @throws ConflictoException           si el producto figura en alguna boleta
     */
    @Transactional
    public void eliminar(Long id) {
        Producto producto = obtener(id);
        try {
            productoRepository.delete(producto);
            // flush para que la violación de la clave foránea ocurra aquí y no al confirmar.
            productoRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new ConflictoException("El producto " + id + " ya se vendió y no se puede eliminar");
        }
    }

    /**
     * Valida y copia los datos. Las mismas reglas existen como CHECK en la base de datos; aquí se
     * comprueban antes para responder 400 con un mensaje claro en vez de un error de SQL.
     */
    private void aplicar(Producto producto, DatosProducto datos) {
        if (datos.precio().signum() < 0) {
            throw new SolicitudInvalidaException("El precio no puede ser negativo");
        }
        BigDecimal oferta = datos.precioOferta();
        if (oferta != null && (oferta.signum() < 0 || oferta.compareTo(datos.precio()) >= 0)) {
            throw new SolicitudInvalidaException("El precio de oferta debe ser menor que el precio normal");
        }
        if (datos.stock() < 0) {
            throw new SolicitudInvalidaException("El stock no puede ser negativo");
        }
        producto.setNombre(datos.nombre().trim());
        producto.setCategoria(categoriaService.obtener(datos.categoriaId()));
        producto.setPrecio(datos.precio());
        producto.setPrecioOferta(oferta);
        producto.setImagen(datos.imagen().trim());
        producto.setStock(datos.stock());
    }
}
