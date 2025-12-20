import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from './api';

interface InvoiceSettings {
  headerImageUrl?: string;
  headerHeight?: number;
  headerWidth?: number;
  headerPosition?: 'left' | 'center' | 'right';
}

// Convertir une image URL en base64
async function imageUrlToBase64(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Canvas context not available'));
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

export async function generateInvoicePDF(
  invoice: Invoice & { invoice_number: string }, 
  settings?: InvoiceSettings
) {
  const doc = new jsPDF();
  let startY = 20;

  // En-tête avec image personnalisée si disponible
  if (settings?.headerImageUrl) {
    try {
      console.log('🖼️ Chargement de l\'image d\'en-tête:', settings.headerImageUrl);
      const imageData = await imageUrlToBase64(settings.headerImageUrl);
      
      // Dimensions personnalisées
      const height = settings.headerHeight || 40;
      const widthPercent = settings.headerWidth || 100;
      const position = settings.headerPosition || 'center';
      
      // Calculer la largeur en mm (page = 210mm, marges = 20mm chaque côté)
      const maxWidth = 170; // 210 - 40 marges
      const width = (maxWidth * widthPercent) / 100;
      
      // Calculer la position X
      let xPos = 20; // left
      if (position === 'center') {
        xPos = 20 + (maxWidth - width) / 2;
      } else if (position === 'right') {
        xPos = 20 + maxWidth - width;
      }
      
      // Convertir hauteur px en mm (environ 0.26mm par px)
      const heightMm = height * 0.35;
      
      doc.addImage(imageData, 'PNG', xPos, 10, width, heightMm);
      startY = 15 + heightMm;
      console.log('✅ Image d\'en-tête ajoutée');
    } catch (error) {
      console.error('❌ Erreur lors du chargement de l\'image d\'en-tête:', error);
      // En cas d'erreur, afficher le titre par défaut
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      if (invoice.type === 'proforma') {
        doc.text('FACTURE PROFORMA', 20, 20);
        doc.setFontSize(10);
        doc.setTextColor(255, 0, 0);
        doc.text('PROFORMA - Non valable pour paiement', 20, 28);
        doc.setTextColor(0, 0, 0);
      } else {
        doc.text('FACTURE', 20, 20);
      }
      startY = 40;
    }
  } else {
    // En-tête par défaut
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    if (invoice.type === 'proforma') {
      doc.text('FACTURE PROFORMA', 20, 20);
      doc.setFontSize(10);
      doc.setTextColor(255, 0, 0);
      doc.text('PROFORMA - Non valable pour paiement', 20, 28);
      doc.setTextColor(0, 0, 0);
    } else {
      doc.text('FACTURE', 20, 20);
    }
    startY = 40;
  }

  // Numéro de facture
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${invoice.invoice_number}`, 20, startY);
  
  if (invoice.created_at) {
    const date = new Date(invoice.created_at).toLocaleDateString('fr-FR');
    doc.text(`Date: ${date}`, 20, startY + 7);
  }

  // Client
  const clientY = startY + 20;
  if (invoice.client_name) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Client:', 20, clientY);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.client_name, 20, clientY + 7);
    if (invoice.client_address) {
      doc.text(invoice.client_address, 20, clientY + 14);
    }
  }

  // Table des articles
  const tableStartY = invoice.client_name ? clientY + 25 : clientY;

  autoTable(doc, {
    startY: tableStartY,
    head: [['Désignation', 'Quantité', 'Prix unitaire', 'Total']],
    body: invoice.items.map((item) => [
      item.designation,
      item.quantity.toString(),
      `${item.unit_price.toFixed(0)} FCFA`,
      `${(item.quantity * item.unit_price).toFixed(0)} FCFA`,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
  });

  // Totaux
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(11);
  doc.text(`Total HT: ${invoice.total_ht?.toFixed(0)} FCFA`, 120, finalY);
  doc.text(`TVA (${invoice.vat_rate}%): ${invoice.total_vat?.toFixed(0)} FCFA`, 120, finalY + 7);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Total TTC: ${invoice.total_ttc?.toFixed(0)} FCFA`, 120, finalY + 15);

  // Sauvegarder le PDF
  const fileName = `${invoice.type === 'proforma' ? 'proforma' : 'facture'}-${invoice.invoice_number}.pdf`;
  doc.save(fileName);
}

export async function printInvoice(
  invoice: Invoice & { invoice_number: string },
  settings?: InvoiceSettings
) {
  const doc = new jsPDF();
  let startY = 20;

  // En-tête avec image personnalisée si disponible
  if (settings?.headerImageUrl) {
    try {
      const imageData = await imageUrlToBase64(settings.headerImageUrl);
      
      // Dimensions personnalisées
      const height = settings.headerHeight || 40;
      const widthPercent = settings.headerWidth || 100;
      const position = settings.headerPosition || 'center';
      
      const maxWidth = 170;
      const width = (maxWidth * widthPercent) / 100;
      
      let xPos = 20;
      if (position === 'center') {
        xPos = 20 + (maxWidth - width) / 2;
      } else if (position === 'right') {
        xPos = 20 + maxWidth - width;
      }
      
      const heightMm = height * 0.35;
      
      doc.addImage(imageData, 'PNG', xPos, 10, width, heightMm);
      startY = 15 + heightMm;
    } catch (error) {
      console.error('Erreur lors du chargement de l\'image d\'en-tête:', error);
      // En cas d'erreur, afficher le titre par défaut
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      if (invoice.type === 'proforma') {
        doc.text('FACTURE PROFORMA', 20, 20);
        doc.setFontSize(10);
        doc.setTextColor(255, 0, 0);
        doc.text('PROFORMA - Non valable pour paiement', 20, 28);
        doc.setTextColor(0, 0, 0);
      } else {
        doc.text('FACTURE', 20, 20);
      }
      startY = 40;
    }
  } else {
    // En-tête par défaut
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    if (invoice.type === 'proforma') {
      doc.text('FACTURE PROFORMA', 20, 20);
      doc.setFontSize(10);
      doc.setTextColor(255, 0, 0);
      doc.text('PROFORMA - Non valable pour paiement', 20, 28);
      doc.setTextColor(0, 0, 0);
    } else {
      doc.text('FACTURE', 20, 20);
    }
    startY = 40;
  }

  // Numéro de facture
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${invoice.invoice_number}`, 20, startY);
  
  if (invoice.created_at) {
    const date = new Date(invoice.created_at).toLocaleDateString('fr-FR');
    doc.text(`Date: ${date}`, 20, startY + 7);
  }

  // Client
  const clientY = startY + 20;
  if (invoice.client_name) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Client:', 20, clientY);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.client_name, 20, clientY + 7);
    if (invoice.client_address) {
      doc.text(invoice.client_address, 20, clientY + 14);
    }
  }

  // Table des articles
  const tableStartY = invoice.client_name ? clientY + 25 : clientY;

  autoTable(doc, {
    startY: tableStartY,
    head: [['Désignation', 'Quantité', 'Prix unitaire', 'Total']],
    body: invoice.items.map((item) => [
      item.designation,
      item.quantity.toString(),
      `${item.unit_price.toFixed(0)} FCFA`,
      `${(item.quantity * item.unit_price).toFixed(0)} FCFA`,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
  });

  // Totaux
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(11);
  doc.text(`Total HT: ${invoice.total_ht?.toFixed(0)} FCFA`, 120, finalY);
  doc.text(`TVA (${invoice.vat_rate}%): ${invoice.total_vat?.toFixed(0)} FCFA`, 120, finalY + 7);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`Total TTC: ${invoice.total_ttc?.toFixed(0)} FCFA`, 120, finalY + 15);

  // Ouvrir la fenêtre d'impression
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
}
