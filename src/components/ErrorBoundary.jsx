/* Error Boundary: atrapa errores de renderizado en los componentes hijos
   y muestra un mensaje amigable en vez de dejar la página en blanco.
   React solo permite crearlos como componente de CLASE, porque usan los
   métodos de ciclo de vida getDerivedStateFromError y componentDidCatch. */
import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hayError: false };
  }

  // Se ejecuta cuando un hijo lanza un error: actualiza el estado
  static getDerivedStateFromError() {
    return { hayError: true };
  }

  // Lugar para registrar el error (aquí solo en consola)
  componentDidCatch(error) {
    console.error("Error capturado por ErrorBoundary:", error.message);
  }

  // Permite al usuario intentar de nuevo
  reiniciar = () => {
    this.setState({ hayError: false });
  };

  render() {
    if (this.state.hayError) {
      return (
        <section className="container py-5 text-center" role="alert">
          <h2 className="fw-bold text-uppercase">Algo salió mal</h2>
          <p className="text-muted">Ocurrió un error inesperado al mostrar esta sección.</p>
          <button type="button" className="btn btn-dark rounded-0 fw-bold" onClick={this.reiniciar}>
            REINTENTAR
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}
