
interface IStartEndDate {
  startDate: Date
  endDate: Date
}

export const calculateDates = (numeroDeMeses: number): IStartEndDate => {
  // Calcular la fecha de inicio (hace numeroDeMeses meses desde ahora)
  const fechaInicio = new Date()
  fechaInicio.setMonth(fechaInicio.getMonth() - numeroDeMeses + 1)

  // Ajustar el día para obtener el primer día del mes de inicio
  fechaInicio.setDate(1)

  // Calcular la fecha de finalización (último día del mes actual)
  const fechaFin = new Date()
  fechaFin.setMonth(fechaFin.getMonth() + 1) // Ir al siguiente mes
  fechaFin.setDate(0) // Volver al último día del mes anterior

  // return {
  //   startDate: fechaInicio.toISOString().slice(0, 10), // Formato YYYY-MM-DD
  //   endDate: fechaFin.toISOString().slice(0, 10) // Formato YYYY-MM-DD
  // }
  return {
    startDate: fechaInicio,
    endDate: fechaFin
  }
}
