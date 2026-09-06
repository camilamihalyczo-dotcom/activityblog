import KidsHeader from '../components/KidsHeader.jsx'
import PhoneticChart from '../components/PhoneticChart.jsx'

// Ruta /infancias/tabla-fonetica — misma tabla de 44 sonidos que
// PhoneticChartPage.jsx (Adultos), pero con la estética de Infancias
// (KidsHeader, fondo kidsCream, tipografías Poppins/Inter). Ver
// PhoneticChart.jsx para la data y la lógica de voz, compartidas.
export default function InfanciasPhoneticChartPage() {
  return (
    <div className="min-h-screen bg-kidsCream">
      <KidsHeader crumbs={['Tabla fonética']} backTo={-1} />
      <PhoneticChart variant="kids" />
    </div>
  )
}
