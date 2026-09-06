import TicketHeader from '../components/TicketHeader.jsx'
import PhoneticChart from '../components/PhoneticChart.jsx'

// Ruta pública /tabla-fonetica — versión Adultos (ver también
// InfanciasPhoneticChartPage.jsx para la versión Infancias, que comparte
// toda la data y la lógica de voz a través de PhoneticChart.jsx).
export default function PhoneticChartPage() {
  return (
    <div className="min-h-screen">
      <TicketHeader crumbs={['Tabla fonética']} backTo={-1} />
      <PhoneticChart variant="adultos" />
    </div>
  )
}
