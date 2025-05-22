import { RendezVous } from "@/components/dashboard/UserAppointments";
import jsPDF from "jspdf";

export function generateDevisPDF(rdv: RendezVous) {
  const doc = new jsPDF();

  const primaryColor = "#0A84FF";
  const grayColor = "#666666";

  doc.setFontSize(20);
  doc.setTextColor(primaryColor);
  doc.text("Devis - Rendez-vous", 14, 20);

  doc.setDrawColor(200);
  doc.line(14, 24, 196, 24);

  doc.setFontSize(10);
  doc.setTextColor(grayColor);
  doc.text(`Document généré le ${new Date().toLocaleString("fr-FR")}`, 14, 30);

  let y = 40;

  doc.setFontSize(12);
  doc.setTextColor("#000000");
  doc.text("Détails du rendez-vous", 14, y);
  y += 8;
  doc.setTextColor(grayColor);
  doc.text(`Début : ${new Date(rdv.dateDebut).toLocaleString("fr-FR")}`, 14, y);
  y += 6;
  doc.text(`Fin : ${new Date(rdv.dateFin).toLocaleString("fr-FR")}`, 14, y);
  y += 10;

  doc.setTextColor("#000000");
  doc.text("Véhicule", 14, y);
  y += 8;
  doc.setTextColor(grayColor);
  doc.text(`Immatriculation : ${rdv.immatriculation}`, 14, y);
  y += 6;
  doc.text(`Modèle : ${rdv.modele}`, 14, y);
  y += 6;
  doc.text(`Description : ${rdv.description}`, 14, y);
  y += 10;

  doc.setTextColor("#000000");
  doc.text("Garage", 14, y);
  y += 8;
  doc.setTextColor(grayColor);
  if (rdv.garage) {
    doc.text(`${rdv.garage.name}`, 14, y);
    y += 6;
    doc.text(`${rdv.garage.address}, ${rdv.garage.city}`, 14, y);
  } else {
    doc.text("Garage non renseigné", 14, y);
  }
  y += 10;

  doc.setTextColor("#000000");
  doc.setFontSize(13);
  doc.text("Prix estimé", 14, y);
  y += 8;
  doc.setFontSize(12);
  doc.text(`${rdv.price.toFixed(2)} € TTC`, 14, y);

  doc.save(`devis_rdv_${rdv.id}.pdf`);
}