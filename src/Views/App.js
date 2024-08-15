import React, { useState } from "react";
import Swal from "sweetalert2";

import { Container, TextField, FormControlLabel, Checkbox } from "@mui/material";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// import TableComponent from "../Components/TablaDatos";
import Colapsible from "../Components/Colapsible";

const App = () => {
  const [state, setState] = useState({
    nombreSorteo: "",
    permisoSorteo: "",
    vigenciaSorteo: {
      inicio: "",
      fin: "",
    },
    numeroEmision: "",
    longitudFolio: "",
    folioInicial: "",
    folioFinal: "",
    cantidad: "",
  });
  const [ordenar, setOrdenar] = useState(false)

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

  const generateFolios = (e) => {
    e.preventDefault();

    if (state.folioFinal < state.folioInicial) {
      alert("El folio final debe ser mayor o igual al folio inicial.");
      return;
    }

    if (state.cantidad > state.folioFinal - state.folioInicial + 1) {
      alert(
        "La cantidad de folios a generar no puede ser mayor a la diferencia entre el folio final y el folio inicial."
      );
      return;
    }

    // let warningLabel = document.getElementById("warningLabel");
    // warningLabel.textContent = "";

    if (
      String(state.folioInicial).length > state.longitudFolio ||
      String(state.folioFinal).length > state.longitudFolio
    ) {
      // warningLabel.textContent =
      //   "Advertencia: El folio inicial o final excede la longitud especificada. La generación de folios se hará en formato entero.";
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
          parseInt(denominaciones[indexDenominacion].cantidad) <=
          folioDenominacion.length
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
      console.log("ordenarlos");
      foliosPremios.map(folio => {
        return folio.folios.sort((a, b) => {
          return a.localeCompare(b);
        })
      })
    }

    setFolios(foliosPremios);
  };

  const changeValue = (e) => {
    setState({
      ...state,
      [e.target.name]: e.target.value,
    });
  };

  const changeDenominacion = (e) => {
    let copiaDenominaciones = [...denominaciones];
    let total = 0;

    if (e.target.value !== "") {
      copiaDenominaciones.map((denominacion, index) => {
        if (index !== parseInt(e.target.name)) {
          total += parseInt(denominacion.cantidad);
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

    copiaDenominaciones[e.target.name].cantidad = e.target.value;

    setDenominaciones(copiaDenominaciones);
  };

  const exportarExcel = () => {
    // Datos de ejemplo
    const foliosData = [...folios];

    foliosData.map((folio) => {
      let data = folio.folios;

      // Convertir los datos en un formato de hoja de cálculo
      const ws = XLSX.utils.aoa_to_sheet(data.map((item) => [item]));

      // Crear un nuevo libro de trabajo y añadir la hoja de cálculo
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      // Generar un archivo Excel (.xlsx)
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

      // Guardar el archivo con FileSaver
      saveAs(
        new Blob([wbout], { type: "application/octet-stream" }),
        `${state.nombreSorteo}-${folio.valor}.xlsx`
      );

      return true;
    });
  };

  return (
    <Container maxWidth="md">
      <h1>Generador de folios</h1>

      <section>
        <form onSubmit={generateFolios} id="folioForm">
          <p style={{ marginBottom: "10px" }}>Información de sorteo</p>
          <div className="contenedor">
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

          <p style={{ marginBottom: "10px", marginTop: "40px" }}>Información de premios</p>
          <div className="contenedor">
            {denominaciones.map((denominacion, index) => (
              <TextField
                onChange={changeDenominacion}
                value={denominacion.cantidad}
                type="number"
                id={index}
                name={index}
                label={`Cantidad de ${denominacion.valor}`}
                variant="outlined"
                required
                disabled={parseInt(state.cantidad) <= 0 || state.cantidad === ""}
              />
            ))}

            <FormControlLabel onChange={() => { setOrdenar(!ordenar) }} control={<Checkbox />} label="Ordenar de menor a mayor" />
            <button type="submit">Generar Folios</button>
          </div>

        </form>
      </section>

      {/* <section>
        {folios.length > 0 && <TableComponent data={state} folios={folios} denominaciones={denominaciones} />}
      </section> */}

      <section>
        <Colapsible folios={folios} />
        {folios.length > 0 &&
          <button
            style={{ marginTop: "25px" }}
            onClick={exportarExcel}
            type="submit"
          >
            Descargar Folios
          </button>
        }
      </section>
    </Container>
  );
};

export default App;
