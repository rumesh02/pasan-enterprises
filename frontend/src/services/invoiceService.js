import jsPDF from 'jspdf';

// Function to convert number to words
const numberToWords = (num) => {
  const ones = [
    '', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE',
    'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN',
    'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'
  ];
  
  const tens = [
    '', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'
  ];
  
  const scales = ['', 'THOUSAND', 'MILLION', 'BILLION'];
  
  if (num === 0) return 'ZERO';
  
  const convertChunk = (chunk) => {
    let result = '';
    
    if (chunk >= 100) {
      result += ones[Math.floor(chunk / 100)] + ' HUNDRED ';
      chunk %= 100;
    }
    
    if (chunk >= 20) {
      result += tens[Math.floor(chunk / 10)] + ' ';
      chunk %= 10;
    }
    
    if (chunk > 0) {
      result += ones[chunk] + ' ';
    }
    
    return result.trim();
  };
  
  let result = '';
  let scaleIndex = 0;
  
  while (num > 0) {
    const chunk = num % 1000;
    if (chunk !== 0) {
      const chunkWords = convertChunk(chunk);
      if (scaleIndex > 0) {
        result = chunkWords + ' ' + scales[scaleIndex] + ' ' + result;
      } else {
        result = chunkWords + ' ' + result;
      }
    }
    num = Math.floor(num / 1000);
    scaleIndex++;
  }
  
  return result.trim() + ' RUPEES ONLY';
};

// Function to format number with comma separators
const formatNumberWithCommas = (num) => {
  if (typeof num !== 'number') {
    num = parseFloat(num) || 0;
  }
  return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Function to load image as base64
const loadImageAsBase64 = (imagePath) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function() {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = this.naturalWidth;
      canvas.height = this.naturalHeight;
      ctx.drawImage(this, 0, 0);
      try {
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = reject;
    img.src = imagePath;
  });
};

export const generateInvoice = async (saleData, orderData) => {
  try {
    // Create new PDF document
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    let yPosition = 20;
    
    // Load logo
    let logoBase64 = null;
    try {
      logoBase64 = await loadImageAsBase64('/images/logo1.png');
    } catch (error) {
      console.warn('Could not load logo:', error);
    }
    
    // Add logo and watermark
    if (logoBase64) {
      // Logo in top left (square, bigger size)
      const logoSize = 40; // Increased from 30x20 to 40x40 (square)
      doc.addImage(logoBase64, 'PNG', 15, 10, logoSize, logoSize);
      
      // Watermark (logo in center, transparent, bigger)
      const watermarkSize = 150; // Increased from 80 to 120
      const watermarkX = (pageWidth - watermarkSize) / 2;
      const watermarkY = (pageHeight - watermarkSize) / 2;
      
      // Save the current graphics state
      doc.saveGraphicsState();
      doc.setGState(doc.GState({ opacity: 0.2 }));
      doc.addImage(logoBase64, 'PNG', watermarkX, watermarkY, watermarkSize, watermarkSize);
      doc.restoreGraphicsState();
    }
    
    // Company details (top right)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('P.E. INDUSTRIAL AUTOMATION (PVT). LTD', pageWidth - 15, 15, { align: 'right' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('194/20/12, Thalgahahena Road, Kesbewa,', pageWidth - 15, 22, { align: 'right' });
    doc.text('Piliyandala, Sri Lanka.', pageWidth - 15, 27, { align: 'right' });
    doc.text('+94717694334', pageWidth - 15, 32, { align: 'right' });
    doc.text('+94763995483', pageWidth - 15, 37, { align: 'right' });
    
    yPosition = 55; // Increased from 50 to 55 to account for bigger logo
    
    // Invoice title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;
    
    // Invoice details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const currentDate = new Date();
    const invoiceDate = currentDate.toLocaleDateString();
    const invoiceTime = currentDate.toLocaleTimeString();
    
    doc.text(`Buyer: ${saleData.customerInfo.name}`, 15, yPosition);
    doc.text(`Invoice Number: ${orderData.orderId}`, pageWidth - 15, yPosition, { align: 'right' });
    yPosition += 6;
    
    doc.text(`Date: ${invoiceDate}`, 15, yPosition);
    doc.text(`Time: ${invoiceTime}`, pageWidth - 15, yPosition, { align: 'right' });
    yPosition += 15;
    
    // Table header
    const colPositions = [15, 30, 110, 135, 170]; // No., Description, Qty, Unit Price, Amount
    
    // Draw table header
    doc.setFillColor(240, 240, 240);
    doc.rect(15, yPosition - 5, pageWidth - 30, 10, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.text('No.', colPositions[0], yPosition);
    doc.text('Description', colPositions[1], yPosition);
    doc.text('Qty', colPositions[2], yPosition);
    doc.text('Unit Price (Rs)', colPositions[3] + 30, yPosition, { align: 'right' });
    doc.text('Amount', colPositions[4] + 25, yPosition, { align: 'right' });
    
    yPosition += 10;
    
    // Table content
    doc.setFont('helvetica', 'normal');
    let itemNumber = 1;
    let totalAmount = 0;
    
    // Add cart items
    saleData.items.forEach((item, index) => {
      const cartItem = saleData.cart?.find(c => c.machineId === item.machineId) || item;
      const itemTotal = (cartItem.unitPrice || item.unitPrice || 0) * (cartItem.quantity || item.quantity || 0);
      totalAmount += itemTotal;
      
      doc.text(itemNumber.toString(), colPositions[0], yPosition);
      doc.text(cartItem.name || item.name || 'Item', colPositions[1], yPosition);
      doc.text((cartItem.quantity || item.quantity || 0).toString(), colPositions[2], yPosition);
      doc.text(formatNumberWithCommas(cartItem.unitPrice || item.unitPrice || 0), colPositions[3] + 30, yPosition, { align: 'right' });
      doc.text(formatNumberWithCommas(itemTotal), colPositions[4] + 25, yPosition, { align: 'right' });
      
      yPosition += 7;
      itemNumber++;
    });
    
    // Add extras if any
    if (saleData.extras && saleData.extras.length > 0) {
      saleData.extras.forEach((extra) => {
        if (extra.description && extra.amount > 0) {
          doc.text(itemNumber.toString(), colPositions[0], yPosition);
          doc.text(extra.description, colPositions[1], yPosition);
          doc.text('1', colPositions[2], yPosition);
          doc.text(formatNumberWithCommas(extra.amount), colPositions[3] + 30, yPosition, { align: 'right' });
          doc.text(formatNumberWithCommas(extra.amount), colPositions[4] + 25, yPosition, { align: 'right' });
          
          totalAmount += extra.amount;
          yPosition += 7;
          itemNumber++;
        }
      });
    }
    
    // Calculate final totals
    const subtotal = saleData.subtotal || totalAmount;
    const vatAmount = saleData.vatAmount || ((subtotal * (saleData.vatRate || 0)) / 100);
    const discountAmount = saleData.discountAmount || 0;
    const finalTotal = saleData.finalTotal || (subtotal + vatAmount - discountAmount);
    
    // Add VAT row if applicable
    if (vatAmount > 0) {
      doc.text(itemNumber.toString(), colPositions[0], yPosition);
      doc.text(`VAT (${saleData.vatRate || 15}%)`, colPositions[1], yPosition);
      doc.text('1', colPositions[2], yPosition);
      doc.text(formatNumberWithCommas(vatAmount), colPositions[3] + 30, yPosition, { align: 'right' });
      doc.text(formatNumberWithCommas(vatAmount), colPositions[4] + 25, yPosition, { align: 'right' });
      yPosition += 7;
      itemNumber++;
    }
    
    // Add discount row if applicable
    if (discountAmount > 0) {
      doc.text(itemNumber.toString(), colPositions[0], yPosition);
      doc.text(`Discount (${saleData.discountPercentage || 0}%)`, colPositions[1], yPosition);
      doc.text('1', colPositions[2], yPosition);
      doc.text(`-${formatNumberWithCommas(discountAmount)}`, colPositions[3] + 30, yPosition, { align: 'right' });
      doc.text(`-${formatNumberWithCommas(discountAmount)}`, colPositions[4] + 25, yPosition, { align: 'right' });
      yPosition += 7;
    }
    
    // Draw line above total
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;
    
    // Total amount
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL AMOUNT:', colPositions[2], yPosition);
    doc.text(`Rs. ${formatNumberWithCommas(finalTotal)}`, colPositions[4] + 25, yPosition, { align: 'right' });
    yPosition += 15;
    
    // Amount in words
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const amountInWords = numberToWords(Math.floor(finalTotal));
    doc.text(`SAY TOTAL: ${amountInWords}`, 15, yPosition);
    yPosition += 15;
    
    // Payment terms
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT TERMS:', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 6;
    doc.text('100% by cash on delivery or by a cheque draw to the account name of', 15, yPosition);
    yPosition += 5;
    doc.text('"P.E.INDUSTRIAL AUTOMATION (PVT).LTD"', 15, yPosition);
    yPosition += 10;
    
    // Warranty
    doc.setFont('helvetica', 'bold');
    doc.text('WARRANTY:', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text('12 MONTHS FROM INVOICE DATE', 60, yPosition);
    yPosition += 10;
    
    // Bank details
    doc.setFont('helvetica', 'bold');
    doc.text('BANK DETAILS', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 6;
    doc.text('BANK NAME - BOC BANK (KESBEWA BRANCH)', 15, yPosition);
    yPosition += 5;
    doc.text('ACCOUNT NAME - P.E. INDUSTRIAL AUTOMATION (PVT). LTD', 15, yPosition);
    yPosition += 5;
    doc.text('ACCOUNT NUMBER - 0094292544', 15, yPosition);
    yPosition += 5;
    doc.text('BRANCH CODE - 620', 15, yPosition);
    yPosition += 15;
    
    // Thank you and signature
    doc.text('Thank You.', 15, yPosition);
    yPosition += 5;
    doc.text('Yours Faithfully,', 15, yPosition);
    yPosition += 5;
    doc.text('P.E.INDUSTRIAL AUTOMATION (PVT).LTD', 15, yPosition);
    yPosition += 10;
    doc.text('Approved', 15, yPosition);
    yPosition += 5;
    doc.text('Pradeep Jayawardana', 15, yPosition);
    yPosition += 5;
    doc.text('Director', 15, yPosition);
    
    // Footer note
    doc.setFontSize(8);
    doc.text('Note: Computer Generated Document', 15, pageHeight - 10);
    
    // Generate filename
    const filename = `Invoice_${orderData.orderId}_${currentDate.toISOString().split('T')[0]}.pdf`;
    
    // Save the PDF
    doc.save(filename);
    
    return {
      success: true,
      filename: filename,
      message: 'Invoice generated successfully'
    };
    
  } catch (error) {
    console.error('Error generating invoice:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to generate invoice'
    };
  }
};