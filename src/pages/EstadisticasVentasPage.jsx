import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useAutenticacion } from '../context/ContextoAutenticacion';
import { Navigate } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { usePedidosVendedor } from '../hooks/usePedidosVendedor';
import { useTheme } from '../context/ContextoTema';

/**
 * Página que muestra las estadísticas de ventas del usuario
 */
const EstadisticasVentasPage = () => {
    const { usuario, cargando: cargandoUsuario } = useAutenticacion();
    const { pedidos, cargando: cargandoPedidos, cargarPedidos } = usePedidosVendedor({
        ordenarPorRecientes: true,
        cargarAlInicio: true
    });
    const { isDarkMode } = useTheme();
    
    const [ventasPorMes, setVentasPorMes] = useState([]);
    const [productosMasVendidos, setProductosMasVendidos] = useState([]);

    // Redirigir si no hay usuario autenticado
    if (!cargandoUsuario && !usuario) {
        return <Navigate to="/login" replace />;
    }

    useEffect(() => {
        if (pedidos.length > 0) {
            procesarDatosEstadisticas();
        }
    }, [pedidos]);

    const procesarDatosEstadisticas = () => {
        // Procesar ventas por mes
        const ventasMensuales = procesarVentasPorMes(pedidos);
        setVentasPorMes(ventasMensuales);

        // Procesar productos más vendidos
        const topProductos = procesarProductosMasVendidos(pedidos);
        setProductosMasVendidos(topProductos);

        // La sección de valoraciones promedio ha sido eliminada
    };

    const procesarVentasPorMes = (pedidos) => {
        // Agrupar pedidos por mes
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const ventasPorMes = Array(12).fill(0);
        const ingresosPorMes = Array(12).fill(0);
        
        pedidos.forEach(pedido => {
            const fecha = new Date(pedido.fecha_pedido);
            const mes = fecha.getMonth();
            ventasPorMes[mes]++;
            
            // Calcular ingresos (precio total de los productos vendidos)
            if (pedido.items && pedido.items.length > 0) {
                pedido.items.forEach(item => {
                    ingresosPorMes[mes] += parseFloat(item.precio_unitario) * item.cantidad;
                });
            }
        });

        // Colores adaptados al tema
        const textColor = isDarkMode ? '#f8f9fa' : '#212529';
        const gridColor = isDarkMode ? '#495057' : '#e9e9e9';
        const tooltipBackgroundColor = isDarkMode ? '#343a40' : '#ffffff';
        const tooltipTextColor = isDarkMode ? '#f8f9fa' : '#212529';
        const tooltipBorderColor = isDarkMode ? '#495057' : '#e9e9e9';
        const lineColor = isDarkMode ? '#20c997' : '#0d6efd';
        const barColor = isDarkMode ? '#0dcaf0' : '#0d6efd';

        return {
            series: [
                {
                    name: 'Ventas',
                    type: 'column',
                    data: ventasPorMes
                },
                {
                    name: 'Ingresos (€)',
                    type: 'line',
                    data: ingresosPorMes.map(valor => parseFloat(valor.toFixed(2))),
                    color: lineColor
                }
            ],
            options: {
                chart: {
                    height: 350,
                    type: 'line',
                    toolbar: {
                        show: false
                    },
                    foreColor: '#00cc44',
                    background: 'transparent'
                },
                stroke: {
                    width: [0, 4]
                },
                title: {
                    text: 'Ventas e Ingresos Mensuales',
                    style: {
                        color: '#00cc44',
                        fontWeight: 600
                    }
                },
                dataLabels: {
                    enabled: true,
                    enabledOnSeries: [1],
                    style: {
                        colors: ['#00cc44'],
                        fontWeight: 600,
                        fontSize: '12px',
                        textOutline: 'none'
                    },
                    background: {
                        enabled: true,
                        foreColor: '#00cc44',
                        backgroundColor: isDarkMode ? '#343a40' : '#ffffff',
                        borderRadius: 4,
                        padding: 4,
                        opacity: 0.9,
                        borderWidth: 1,
                        borderColor: tooltipBorderColor,
                        dropShadow: {
                            enabled: true,
                            top: 1,
                            left: 1,
                            blur: 3,
                            color: isDarkMode ? '#000000' : '#cccccc',
                            opacity: 0.5
                        }
                    }
                },
                labels: meses,
                xaxis: {
                    type: 'category',
                    labels: {
                        style: {
                            colors: Array(12).fill('#00cc44')
                        }
                    },
                    axisBorder: {
                        color: gridColor
                    },
                    axisTicks: {
                        color: gridColor
                    }
                },
                yaxis: [
                    {
                        title: {
                            text: 'Ventas',
                            style: {
                                color: '#00cc44'
                            }
                        },
                        labels: {
                            style: {
                                colors: ['#00cc44']
                            }
                        }
                    },
                    {
                        opposite: true,
                        title: {
                            text: 'Ingresos (€)',
                            style: {
                                color: '#00cc44'
                            }
                        },
                        labels: {
                            style: {
                                colors: ['#00cc44']
                            },
                            formatter: function(val) {
                                return val.toFixed(2) + ' €';
                            }
                        }
                    }
                ],
                tooltip: {
                    theme: isDarkMode ? 'dark' : 'light',
                    shared: true,
                    intersect: false,
                    y: {
                        formatter: function(value, { seriesIndex }) {
                            if (seriesIndex === 1) {
                                return value.toFixed(2) + ' €';
                            }
                            return value;
                        }
                    },
                    style: {
                        fontSize: '12px',
                        fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif'
                    },
                    marker: {
                        show: true
                    }
                },
                grid: {
                    borderColor: gridColor,
                    strokeDashArray: 4
                },
                legend: {
                    labels: {
                        colors: textColor
                    },
                    position: 'top',
                    horizontalAlign: 'right'
                },
                colors: [barColor, lineColor]
            }
        };
    };

    const procesarProductosMasVendidos = (pedidos) => {
        // Contar productos vendidos
        const productosVendidos = {};
        
        pedidos.forEach(pedido => {
            if (pedido.items && pedido.items.length > 0) {
                pedido.items.forEach(item => {
                    const id = item.producto_id;
                    if (!productosVendidos[id]) {
                        productosVendidos[id] = {
                            nombre: item.nombre || `Producto sin nombre`,
                            cantidad: 0
                        };
                    }
                    productosVendidos[id].cantidad += item.cantidad;
                });
            }
        });
        
        // Convertir a array y ordenar por cantidad
        const productosArray = Object.values(productosVendidos);
        productosArray.sort((a, b) => b.cantidad - a.cantidad);
        
        // Tomar los 5 más vendidos
        const top5 = productosArray.slice(0, 5);
        
        // Colores adaptados al tema
        const textColor = isDarkMode ? '#f8f9fa' : '#212529';
        const gridColor = isDarkMode ? '#495057' : '#e9e9e9';
        const barColor = isDarkMode ? '#0dcaf0' : '#0d6efd';
        const tooltipBackgroundColor = isDarkMode ? '#343a40' : '#ffffff';
        const tooltipTextColor = isDarkMode ? '#f8f9fa' : '#212529';
        const tooltipBorderColor = isDarkMode ? '#495057' : '#e9e9e9';
        
        return {
            series: [{
                data: top5.map(p => p.cantidad)
            }],
            options: {
                chart: {
                    type: 'bar',
                    height: 350,
                    toolbar: {
                        show: false
                    },
                    foreColor: '#00cc44',
                    background: 'transparent'
                },
                plotOptions: {
                    bar: {
                        borderRadius: 4,
                        horizontal: true,
                        distributed: true,
                        barHeight: '80%',
                        colors: {
                            ranges: [{
                                from: 0,
                                to: 100,
                                color: barColor
                            }]
                        }
                    }
                },
                dataLabels: {
                    enabled: true,
                    style: {
                        colors: ['#00cc44'],
                        fontWeight: 600,
                        fontSize: '12px',
                        textOutline: 'none'
                    },
                    formatter: function(val) {
                        return val.toString();
                    },
                    background: {
                        enabled: true,
                        foreColor: '#00cc44',
                        backgroundColor: isDarkMode ? '#343a40' : '#ffffff',
                        borderRadius: 4,
                        padding: 4,
                        opacity: 0.9,
                        borderWidth: 1,
                        borderColor: tooltipBorderColor,
                        dropShadow: {
                            enabled: true,
                            top: 1,
                            left: 1,
                            blur: 3,
                            color: isDarkMode ? '#000000' : '#cccccc',
                            opacity: 0.5
                        }
                    }
                },
                xaxis: {
                    categories: top5.map(p => p.nombre),
                    title: {
                        text: 'Unidades vendidas',
                        style: {
                            color: '#00cc44'
                        }
                    },
                    labels: {
                        style: {
                            colors: Array(top5.length).fill('#00cc44')
                        }
                    },
                    axisBorder: {
                        color: gridColor
                    },
                    axisTicks: {
                        color: gridColor
                    }
                },
                title: {
                    text: 'Productos Más Vendidos',
                    style: {
                        color: '#00cc44',
                        fontWeight: 600
                    }
                },
                tooltip: {
                    theme: isDarkMode ? 'dark' : 'light',
                    style: {
                        fontSize: '12px',
                        fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif'
                    },
                    marker: {
                        show: true
                    }
                },
                grid: {
                    borderColor: gridColor,
                    strokeDashArray: 4
                },
                legend: {
                    labels: {
                        colors: '#00cc44'
                    }
                }
            }
        };
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4">Estadísticas de Ventas</h2>
            
            {cargandoPedidos ? (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2">Cargando estadísticas...</p>
                </div>
            ) : pedidos.length === 0 ? (
                <Card className="mb-4">
                    <Card.Body className="text-center">
                        <Card.Title>No hay datos disponibles</Card.Title>
                        <Card.Text>
                            Aún no tienes ventas registradas para generar estadísticas.
                        </Card.Text>
                    </Card.Body>
                </Card>
            ) : (
                <Row>
                    <Col lg={8} className="mb-4">
                        <Card>
                            <Card.Body>
                                {ventasPorMes.series && (
                                    <Chart
                                        options={ventasPorMes.options}
                                        series={ventasPorMes.series}
                                        type="line"
                                        height={350}
                                    />
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col xs={12} className="mb-4">
                        <Card>
                            <Card.Body>
                                {productosMasVendidos.series && (
                                    <Chart
                                        options={productosMasVendidos.options}
                                        series={productosMasVendidos.series}
                                        type="bar"
                                        height={350}
                                    />
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default EstadisticasVentasPage;