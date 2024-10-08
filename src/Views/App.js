import React, { useState } from "react";
import Swal from "sweetalert2";

import {
  Container,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import Grid from '@mui/material/Unstable_Grid2';

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import dayjs from 'dayjs';

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import TableComponent from "../Components/TablaDatos";
import Colapsible from "../Components/Colapsible";

const App = () => {
  const [state, setState] = useState({
    nombreSorteo: "",
    permisoSorteo: "",
    vigenciaSorteo: {
      inicio: null,
      fin: null,
    },
    numeroEmision: "",
    longitudFolio: "",
    folioInicial: "",
    folioFinal: "",
    cantidad: "",
  });
  const [ordenar, setOrdenar] = useState(false);

  const [denominaciones, setDenominaciones] = useState([
    {
      valor: "5,00",
      cantidad: "",
    },
    {
      valor: "10,00",
      cantidad: "",
    },
    {
      valor: "20,00",
      cantidad: "",
    },
    {
      valor: "50,00",
      cantidad: "",
    },
    {
      valor: "100,00",
      cantidad: "",
    },
    {
      valor: "500,00",
      cantidad: "",
    },
    {
      valor: "1000,00",
      cantidad: "",
    },
    {
      valor: "20.000,00",
      cantidad: "",
    },
    {
      valor: "500.000,00",
      cantidad: "",
    },
  ]);

  const [folios, setFolios] = useState([]);

  const comprobaciones = (e) => {
    e.preventDefault();

    if (state.folioFinal < state.folioInicial) {
      Swal.fire({
        title: "Error",
        text: `El folio final debe ser mayor o igual al folio inicial`,
        icon: "error",
      });
      return;
    }

    if (state.cantidad > state.folioFinal - state.folioInicial + 1) {
      Swal.fire({
        title: "Error",
        text: `La cantidad de folios a generar no puede ser mayor a la diferencia entre el folio final y el folio inicial.`,
        icon: "error",
      });
      return;
    }

    let total = 0;

    denominaciones.map((denominacion) => {
      total += denominacion.cantidad !== "" ? parseInt(denominacion.cantidad) : 0;

      return true;
    });

    if (total > state.cantidad) {
      return Swal.fire({
        title: "Error",
        text: `La suma de las cantidades no debe ser mayor que el total de premios, tienes un exedente en premios por: ${total - state.cantidad}`,
        icon: "error",
      });
    }

    if (total < state.cantidad) {
      return Swal.fire({
        title: "Error",
        text: `La suma de las cantidades no debe ser menor que el total de premios, tienes un faltante en premios por: ${state.cantidad - total}`,
        icon: "error",
      });
    }

    generateFolios();
  }

  const generateFolios = () => {
    if (
      state.folioInicial > state.longitudFolio ||
      state.folioFinal < state.longitudFolio
    ) {
      Swal.fire({
        title: "warning",
        text: `El folio inicial o final excede la longitud especificada. La generación de folios se hará en formato entero.`,
        icon: "error",
      });
    }

    let folios = new Set();
    let foliosPremios = [...denominaciones];

    // usados para la comparativa y el almacenamiento de cada uno de los folios segun la cantidad de cada denominacion
    let folioDenominacion = [];
    let indexDenominacion = 0;

    while (folios.size < state.cantidad) {
      // guardamos el tamaño del set antes de agregar un nuevo elemento
      let primerSize = folios.size;

      // generamos el folio de forma aleatoria
      let randomFolio =
        Math.floor(
          Math.random() * (state.folioFinal - state.folioInicial + 1)
        ) + state.folioInicial;
      let formattedFolio =
        state.numeroEmision +
        "-" +
        String(randomFolio).padStart(state.longitudFolio, "0");
      folios.add(formattedFolio);

      // guardamos el nuevo tamaño del set
      let ultimoFolio = folios.size;

      // evaluamos si se agrego un dato a el set o el generador dio un folio repetido
      if (ultimoFolio === primerSize + 1) {
        folioDenominacion.push(formattedFolio);

        // evaluamos si de la denominacion actual ya se agregaron todos los premios que se necesitan
        if (
          denominaciones[indexDenominacion].cantidad <= folioDenominacion.length
        ) {
          // agregamos el arreglo de lof folios a la denominacion actual
          foliosPremios[indexDenominacion].folios = folioDenominacion;

          // avanzamos a la siguiente denominacion
          indexDenominacion++;

          //reiniciamos el listado de los folios de la deniminacion actual
          folioDenominacion = [];
        }
      }
    }

    if (ordenar) {
      foliosPremios.map((folio) => {
        return folio.folios.sort((a, b) => {
          return a.localeCompare(b);
        });
      });
    }

    setFolios(foliosPremios);
  };

  const changeValue = (e) => {
    setState({
      ...state,
      [e.target.name]: parseInt(e.target.value)
    });
  };

  const changeState = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value
    });
  };

  const changeDenominacion = (e) => {
    let copiaDenominaciones = [...denominaciones];
    let total = 0;

    if (e.target.value !== "") {
      copiaDenominaciones.map((denominacion, index) => {
        if (index !== parseInt(e.target.name)) {
          total += denominacion.cantidad !== "" ? parseInt(denominacion.cantidad) : 0;
        }

        return true;
      });

      total += parseInt(e.target.value);
    }

    if (total > state.cantidad) {
      return Swal.fire({
        title: "Error",
        text: `La suma de las cantidades no debe ser mayor que el total de premios, tienes un exedente en premios por: ${total - state.cantidad
          }`,
        icon: "error",
      });
    }

    copiaDenominaciones[parseInt(e.target.name)].cantidad = parseInt(e.target.value);

    setDenominaciones(copiaDenominaciones);
  };

  const exportarExcel = () => {
    // Datos de ejemplo
    const foliosData = [...folios];

    const sorteoArray = [
      ["Nombre del Sorteo", state.nombreSorteo],
      ["Permiso del Sorteo", state.permisoSorteo],
      ["Vigencia", "Del", "Al"],
      ["", state.vigenciaSorteo.inicio.toLocaleDateString(), state.vigenciaSorteo.fin.toLocaleDateString()],
      ["Emisión", state.numeroEmision],
      ["Folios", "Del", "Al"],
      ["", state.folioInicial, state.folioFinal],
      ["Cantidad de boletos premiados", state.cantidad],
      ["Cantidad de boletos no premiados", (state.folioFinal - state.cantidad)],
      ["Estructura de premios", "Denominación", "Cantidad"],
    ];

    denominaciones.map(denominacion => {
      sorteoArray.push(["", denominacion.valor, denominacion.cantidad])
      return true;
    })

    // variable para el archivo
    let wbout;

    // Crear hoja de cálculo para el sorteo
    const wsMain = XLSX.utils.aoa_to_sheet(sorteoArray);

    // Establecer el ancho de la primera columna (A)
    wsMain['!cols'] = [{ wpx: 200 }, { wpx: 100 }];

    // Crear un nuevo libro de trabajo y añadir la hoja de cálculo
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsMain, "Info sorteo");

    foliosData.map((folio, index) => {
      let data = [...folio.folios];
      data.unshift("folios")

      // Crear hoja de cálculo para los folios
      const wsFolios = XLSX.utils.aoa_to_sheet(data.map((item) => [item]));

      // Crear un nuevo libro de trabajo y añadir la hoja de cálculo
      XLSX.utils.book_append_sheet(wb, wsFolios, folio.valor);

      return true;
    });

    // Generar un archivo Excel (.xlsx)
    wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

    // Guardar el archivo con FileSaver
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      `sorteo ${state.nombreSorteo} emision ${state.numeroEmision}.xlsx`
    );
  };

  const resetForm = (e) => {
    setState({
      nombreSorteo: "",
      permisoSorteo: "",
      vigenciaSorteo: {
        inicio: null,
        fin: null,
      },
      numeroEmision: "",
      longitudFolio: "",
      folioInicial: "",
      folioFinal: "",
      cantidad: "",
    })

    setDenominaciones([
      {
        valor: "5,00",
        cantidad: "",
      },
      {
        valor: "10,00",
        cantidad: "",
      },
      {
        valor: "20,00",
        cantidad: "",
      },
      {
        valor: "50,00",
        cantidad: "",
      },
      {
        valor: "100,00",
        cantidad: "",
      },
      {
        valor: "500,00",
        cantidad: "",
      },
      {
        valor: "1000,00",
        cantidad: "",
      },
      {
        valor: "20.000,00",
        cantidad: "",
      },
      {
        valor: "500.000,00",
        cantidad: "",
      },
    ])

    setFolios([])

    setOrdenar(false)
  }

  return (
    <Container maxWidth="xl">
      <h1>Generador de folios</h1>
      <Grid spacing={3} container>
        <Grid xs={12} md={5}>
          <div className="sombra">
            <section>
              <form onSubmit={comprobaciones} id="folioForm">
                <p style={{ marginBottom: "10px" }}>Información de sorteo</p>
                <div className="contenedor">
                  <TextField
                    onChange={changeState}
                    value={state.nombreSorteo}
                    type="text"
                    id="nombreSorteo"
                    name="nombreSorteo"
                    label="Nombre del sorteo"
                    variant="outlined"
                    required
                  />

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DatePicker']}>
                      <MobileDatePicker
                        value={state.vigenciaSorteo.inicio}
                        onChange={(value) => {
                          let copiaState = { ...state }
                          copiaState.vigenciaSorteo.inicio = dayjs(value)
                          setState(copiaState)
                        }}
                        label="Fecha inicio"
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </DemoContainer>
                    <DemoContainer components={['DatePicker']}>
                      <MobileDatePicker
                        value={state.vigenciaSorteo.fin}
                        onChange={(value) => {
                          let copiaState = { ...state }
                          copiaState.vigenciaSorteo.fin = dayjs(value)
                          setState(copiaState)
                        }}
                        label="Fecha fin"
                        renderInput={(params) => <TextField {...params} />}
                      />
                    </DemoContainer>
                  </LocalizationProvider>

                  <TextField
                    onChange={changeState}
                    value={state.permisoSorteo}
                    type="text"
                    id="permisoSorteo"
                    name="permisoSorteo"
                    label="Numero de permiso"
                    variant="outlined"
                    required
                  />
                  <TextField
                    onChange={changeValue}
                    value={state.numeroEmision}
                    type="number"
                    id="numeroEmision"
                    name="numeroEmision"
                    label="Número de Emisión"
                    variant="outlined"
                    required
                  />
                  <TextField
                    onChange={changeValue}
                    value={state.longitudFolio}
                    type="number"
                    id="longitudFolio"
                    name="longitudFolio"
                    label="Longitud del Folio"
                    variant="outlined"
                    required
                  />
                  <TextField
                    onChange={changeValue}
                    value={state.folioInicial}
                    type="number"
                    id="folioInicial"
                    name="folioInicial"
                    label="Folio Inicial"
                    variant="outlined"
                    required
                  />
                  <TextField
                    onChange={changeValue}
                    value={state.folioFinal}
                    type="number"
                    id="folioFinal"
                    name="folioFinal"
                    label="Folio Final"
                    variant="outlined"
                    required
                  />
                  <TextField
                    onChange={changeValue}
                    value={state.cantidad}
                    type="number"
                    id="cantidad"
                    name="cantidad"
                    label="Cantidad"
                    variant="outlined"
                    required
                  />
                </div>

                <p style={{ marginBottom: "10px", marginTop: "40px" }}>
                  Información de premios
                </p>
                <div className="contenedor">
                  {denominaciones.map((denominacion, index) => (
                    <TextField
                      onChange={changeDenominacion}
                      value={denominacion.cantidad}
                      type="number"
                      id={index}
                      name={index}
                      label={`Cantidad de premios para ${denominacion.valor}`}
                      variant="outlined"
                      required
                      disabled={
                        parseInt(state.cantidad) <= 0 || state.cantidad === ""
                      }
                    />
                  ))}

                  <FormControlLabel
                    onChange={() => {
                      setOrdenar(!ordenar);
                    }}
                    checked={ordenar}
                    control={<Checkbox />}
                    label="Ordenar de menor a mayor"
                  />

                  <div style={{ display: "flex", gap: "20px" }}>
                    <button className="boton" type="submit">
                      Generar Folios
                    </button>
                    <button onClick={resetForm} className="boton" type="reset">
                      Vaciar formulario
                    </button>
                  </div>
                </div>
              </form>
            </section>
          </div>
        </Grid>
        <Grid xs={12} md={7}>
          <div className="sombra">
            <section>
              <TableComponent data={state} denominaciones={denominaciones} />
            </section>


            <section>
              <Colapsible folios={folios} />
              {folios.length > 0 && (
                <button
                  className="boton"
                  style={{ marginTop: "25px" }}
                  onClick={exportarExcel}
                  type="submit"
                >
                  Descargar Folios
                </button>
              )}
            </section>
          </div>
        </Grid>
      </Grid>

    </Container >
  );
};

export default App;
