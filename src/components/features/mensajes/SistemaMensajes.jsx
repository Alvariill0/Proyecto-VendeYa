import React, { useState } from 'react';
import { Row, Col, Card, Button, Modal, Form, InputGroup } from 'react-bootstrap';
import { FaSearch, FaPaperPlane, FaPlus } from 'react-icons/fa';
import { useMensajes } from '../../../hooks/useMensajes';
import { useAutenticacion } from '../../../context/ContextoAutenticacion';
import { useTheme } from '../../../context/ContextoTema';
import EstadoCarga from '../../common/EstadoCarga';
import ListaConversaciones from './ListaConversaciones';
import AreaChat from './AreaChat';

/**
 * Componente principal del sistema de mensajería
 * @returns {JSX.Element} Componente de sistema de mensajes
 */
function SistemaMensajes() {
    const { usuario } = useAutenticacion();
    const { isDarkMode } = useTheme();
    const {
        conversaciones,
        mensajesActuales,
        conversacionActual,
        usuarioActual,
        cargando,
        cargandoMensajes,
        error,
        resultadosBusqueda,
        buscando,
        cargarConversaciones,
        cargarMensajesConversacion,
        enviarNuevoMensaje,
        iniciarNuevaConversacion,
        buscarUsuariosParaConversacion,
        formatearFecha
    } = useMensajes({ cargarAlInicio: true });

    const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
    const [terminoBusqueda, setTerminoBusqueda] = useState('');
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [mensajeActual, setMensajeActual] = useState('');

    // Manejar selección de conversación
    const handleSeleccionarConversacion = (conversacion) => {
        cargarMensajesConversacion(conversacion.id, {
            id: conversacion.otro_usuario_id,
            nombre: conversacion.otro_usuario_nombre
        });
    };

    // Manejar envío de mensaje
    const handleEnviarMensaje = async (e) => {
        e.preventDefault();
        if (!mensajeActual.trim()) return;

        try {
            await enviarNuevoMensaje(mensajeActual);
            setMensajeActual('');
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
        }
    };

    // Manejar búsqueda de usuarios
    const handleBuscarUsuarios = (e) => {
        const valor = e.target.value;
        setTerminoBusqueda(valor);
        buscarUsuariosParaConversacion(valor);
    };

    // Manejar selección de usuario para nueva conversación
    const handleSeleccionarUsuario = (usuario) => {
        setUsuarioSeleccionado(usuario);
    };

    // Manejar inicio de nueva conversación
    const handleIniciarConversacion = async (e) => {
        e.preventDefault();
        if (!usuarioSeleccionado || !nuevoMensaje.trim()) return;

        try {
            await iniciarNuevaConversacion(usuarioSeleccionado.id, nuevoMensaje);
            setMostrarModalNuevo(false);
            setUsuarioSeleccionado(null);
            setNuevoMensaje('');
            setTerminoBusqueda('');
        } catch (error) {
            console.error('Error al iniciar conversación:', error);
        }
    };

    return (
        <div className="sistema-mensajes">
            <Row>
                <Col md={4} className="mb-4 mb-md-0">
                    <Card className="h-100">
                        <Card.Header className="d-flex justify-content-between align-items-center bg-primary text-white">
                            <h5 className="mb-0">Conversaciones</h5>
                            <Button 
                                variant="light" 
                                size="sm" 
                                onClick={() => setMostrarModalNuevo(true)}
                                title="Nueva conversación"
                            >
                                <FaPlus />
                            </Button>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <EstadoCarga
                                cargando={cargando}
                                error={error}
                                vacio={conversaciones.length === 0}
                                mensajeVacio="No tienes conversaciones activas."
                            >
                                <ListaConversaciones
                                    conversaciones={conversaciones}
                                    conversacionActual={conversacionActual}
                                    onSeleccionarConversacion={handleSeleccionarConversacion}
                                    formatearFecha={formatearFecha}
                                />
                            </EstadoCarga>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={8}>
                    <Card className="h-100">
                        {conversacionActual ? (
                            <>
                                <Card.Header className="bg-primary text-white">
                                    <h5 className="mb-0">{usuarioActual?.nombre}</h5>
                                </Card.Header>
                                <Card.Body className="p-0">
                                    <EstadoCarga
                                        cargando={cargandoMensajes}
                                        error={error}
                                        vacio={mensajesActuales.length === 0}
                                        mensajeVacio="No hay mensajes en esta conversación."
                                    >
                                        <AreaChat
                                            mensajes={mensajesActuales}
                                            usuarioActual={usuario}
                                            formatearFecha={formatearFecha}
                                        />
                                    </EstadoCarga>
                                </Card.Body>
                                <Card.Footer className="p-2">
                                    <Form onSubmit={handleEnviarMensaje}>
                                        <InputGroup>
                                            <Form.Control
                                                type="text"
                                                placeholder="Escribe un mensaje..."
                                                value={mensajeActual}
                                                onChange={(e) => setMensajeActual(e.target.value)}
                                                disabled={cargandoMensajes}
                                                className={isDarkMode ? "bg-dark text-light border-secondary" : ""}
                                            />
                                            <Button 
                                                type="submit" 
                                                variant="primary"
                                                disabled={!mensajeActual.trim() || cargandoMensajes}
                                            >
                                                <FaPaperPlane />
                                            </Button>
                                        </InputGroup>
                                    </Form>
                                </Card.Footer>
                            </>
                        ) : (
                            <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center p-5">
                                <h4>Selecciona una conversación</h4>
                                <p className={isDarkMode ? "text-light-50" : "text-muted"}>O inicia una nueva conversación con el botón + en la lista de conversaciones.</p>
                            </Card.Body>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Modal para nueva conversación */}
            <Modal show={mostrarModalNuevo} onHide={() => setMostrarModalNuevo(false)}>
                <Modal.Header closeButton className={isDarkMode ? "bg-dark text-light border-secondary" : ""}>
                    <Modal.Title>Nueva conversación</Modal.Title>
                </Modal.Header>
                <Modal.Body className={isDarkMode ? "bg-dark text-light" : ""}>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Buscar usuario</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Nombre o email del usuario"
                                    value={terminoBusqueda}
                                    onChange={handleBuscarUsuarios}
                                    className={isDarkMode ? "bg-dark text-light border-secondary" : ""}
                                />
                                <Button variant={isDarkMode ? "outline-light" : "outline-secondary"}>
                                    <FaSearch />
                                </Button>
                            </InputGroup>
                        </Form.Group>

                        {buscando ? (
                            <div className="text-center py-3">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                        ) : resultadosBusqueda.length > 0 ? (
                            <div className="list-group mb-3">
                                {resultadosBusqueda.map(usuario => (
                                    <button
                                        key={usuario.id}
                                        type="button"
                                        className={`list-group-item list-group-item-action ${isDarkMode ? "bg-dark text-light border-secondary" : ""} ${usuarioSeleccionado?.id === usuario.id ? 'active' : ''}`}
                                        onClick={() => handleSeleccionarUsuario(usuario)}
                                    >
                                        {usuario.nombre} ({usuario.email})
                                    </button>
                                ))}
                            </div>
                        ) : terminoBusqueda ? (
                            <p className={isDarkMode ? "text-light-50" : "text-muted"}>No se encontraron usuarios con ese criterio.</p>
                        ) : null}

                        {usuarioSeleccionado && (
                            <Form.Group className="mb-3">
                                <Form.Label>Mensaje</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Escribe tu primer mensaje..."
                                    value={nuevoMensaje}
                                    onChange={(e) => setNuevoMensaje(e.target.value)}
                                    className={isDarkMode ? "bg-dark text-light border-secondary" : ""}
                                />
                            </Form.Group>
                        )}
                    </Form>
                </Modal.Body>
                <Modal.Footer className={isDarkMode ? "bg-dark text-light border-secondary" : ""}>
                    <Button variant="secondary" onClick={() => setMostrarModalNuevo(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleIniciarConversacion}
                        disabled={!usuarioSeleccionado || !nuevoMensaje.trim()}
                    >
                        Iniciar conversación
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default SistemaMensajes;