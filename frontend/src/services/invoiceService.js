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
    const marginBottom = 30; // Reserve space for footer
    
    let yPosition = 20;
    let currentPage = 1;
    
    // Load logo
    let logoBase64 = null;
    try {
      logoBase64 = await loadImageAsBase64('/images/logo1.png');
    } catch (error) {
      console.warn('Could not load logo:', error);
    }
    
    // Function to add header to each page
    const addHeader = () => {
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
      
      // Page number (if not first page)
      if (currentPage > 1) {
        doc.setFontSize(8);
        doc.text(`Page ${currentPage}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
    };
    
    // Function to check if we need a new page
    const checkNewPage = (requiredSpace = 15) => {
      if (yPosition + requiredSpace > pageHeight - marginBottom) {
        doc.addPage();
        currentPage++;
        addHeader();
        yPosition = 55; // Reset position after header
        return true;
      }
      return false;
    };
    
    // Add header to first page
    addHeader();
    
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
    
    // Function to draw table header
    const drawTableHeader = () => {
      const colPositions = [15, 30, 75, 100, 125, 150, 175]; // No., Description, Qty, Unit Price, VAT%, Warranty, Amount
      
      // Check if we need a new page for header
      checkNewPage(15);
      
      // Draw table header
      doc.setFillColor(240, 240, 240);
      doc.rect(15, yPosition - 5, pageWidth - 30, 10, 'F');
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('No.', colPositions[0], yPosition);
      doc.text('Description', colPositions[1], yPosition);
      doc.text('Qty', colPositions[2], yPosition);
      doc.text('Unit Price', colPositions[3] + 10, yPosition, { align: 'right' });
      doc.text('VAT%', colPositions[4] + 10, yPosition, { align: 'right' });
      doc.text('Warranty', colPositions[5] + 15, yPosition, { align: 'right' });
      doc.text('Amount', colPositions[6] + 20, yPosition, { align: 'right' });
      
      yPosition += 10;
      return colPositions;
    };
    
    // Draw initial table header
    const colPositions = drawTableHeader();
    
    // Table content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    let itemNumber = 1;
    let totalAmount = 0;
    
    // Add cart items with detailed information
    saleData.items.forEach((item, index) => {
      // Check if we need a new page for this item
      checkNewPage(10);
      
      const cartItem = saleData.cart?.find(c => c.machineId === item.machineId) || item;
      const itemTotal = (cartItem.unitPrice || item.unitPrice || 0) * (cartItem.quantity || item.quantity || 0);
      totalAmount += itemTotal;
      
      const vatPercentage = cartItem.vatPercentage || item.vatPercentage || 0;
      const warrantyMonths = cartItem.warrantyMonths || item.warrantyMonths || 12;
      
      doc.text(itemNumber.toString(), colPositions[0], yPosition);
      
      // Handle long descriptions by wrapping text
      const description = cartItem.name || item.name || 'Item';
      if (description.length > 20) {
        const words = description.split(' ');
        let line1 = '', line2 = '';
        let currentLength = 0;
        
        for (let word of words) {
          if (currentLength + word.length + 1 <= 20) {
            line1 += (line1 ? ' ' : '') + word;
            currentLength += word.length + 1;
          } else {
            line2 += (line2 ? ' ' : '') + word;
          }
        }
        
        doc.text(line1, colPositions[1], yPosition);
        if (line2) {
          doc.text(line2, colPositions[1], yPosition + 3);
        }
      } else {
        doc.text(description, colPositions[1], yPosition);
      }
      
      doc.text((cartItem.quantity || item.quantity || 0).toString(), colPositions[2], yPosition);
      doc.text(formatNumberWithCommas(cartItem.unitPrice || item.unitPrice || 0), colPositions[3] + 10, yPosition, { align: 'right' });
      doc.text(vatPercentage.toString() + '%', colPositions[4] + 10, yPosition, { align: 'right' });
      doc.text(warrantyMonths.toString() + 'M', colPositions[5] + 15, yPosition, { align: 'right' });
      doc.text(formatNumberWithCommas(itemTotal), colPositions[6] + 20, yPosition, { align: 'right' });
      
      yPosition += 8;
      itemNumber++;
    });
    
    // Add separator line for machines section
    if (saleData.items.length > 0) {
      checkNewPage(10);
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 5;
      
      // Machines subtotal
      doc.setFont('helvetica', 'bold');
      doc.text('MACHINES SUBTOTAL:', colPositions[4], yPosition);
      doc.text(`Rs. ${formatNumberWithCommas(totalAmount)}`, colPositions[6] + 20, yPosition, { align: 'right' });
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
    }
    
    // Add extras if any
    if (saleData.extras && saleData.extras.length > 0) {
      checkNewPage(15);
      
      // Extra charges header
      doc.setFont('helvetica', 'bold');
      doc.text('EXTRA CHARGES:', 15, yPosition);
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
      
      saleData.extras.forEach((extra) => {
        if (extra.description && extra.amount > 0) {
          checkNewPage(8);
          
          doc.text(itemNumber.toString(), colPositions[0], yPosition);
          
          // Handle long extra descriptions
          const description = extra.description;
          if (description.length > 25) {
            const words = description.split(' ');
            let line1 = '', line2 = '';
            let currentLength = 0;
            
            for (let word of words) {
              if (currentLength + word.length + 1 <= 25) {
                line1 += (line1 ? ' ' : '') + word;
                currentLength += word.length + 1;
              } else {
                line2 += (line2 ? ' ' : '') + word;
              }
            }
            
            doc.text(line1, colPositions[1], yPosition);
            if (line2) {
              doc.text(line2, colPositions[1], yPosition + 3);
            }
          } else {
            doc.text(description, colPositions[1], yPosition);
          }
          
          doc.text('1', colPositions[2], yPosition);
          doc.text(formatNumberWithCommas(extra.amount), colPositions[3] + 10, yPosition, { align: 'right' });
          doc.text('-', colPositions[4] + 10, yPosition, { align: 'right' });
          doc.text('-', colPositions[5] + 15, yPosition, { align: 'right' });
          doc.text(formatNumberWithCommas(extra.amount), colPositions[6] + 20, yPosition, { align: 'right' });
          
          totalAmount += extra.amount;
          yPosition += 8;
          itemNumber++;
        }
      });
      
      // Extra charges subtotal
      checkNewPage(10);
      doc.line(15, yPosition, pageWidth - 15, yPosition);
      yPosition += 5;
      
      const extrasTotal = saleData.extras.reduce((sum, extra) => sum + (extra.amount || 0), 0);
      doc.setFont('helvetica', 'bold');
      doc.text('EXTRA CHARGES SUBTOTAL:', colPositions[4], yPosition);
      doc.text(`Rs. ${formatNumberWithCommas(extrasTotal)}`, colPositions[6] + 20, yPosition, { align: 'right' });
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
    }
    
    // Calculate final totals
    const subtotal = saleData.subtotal || totalAmount;
    const vatAmount = saleData.vatAmount || 0;
    const discountAmount = saleData.discountAmount || 0;
    const finalTotal = saleData.finalTotal || (subtotal + vatAmount - discountAmount);
    
    // SUMMARY SECTION
    checkNewPage(40); // Reserve space for summary section
    
    // Draw thick separator line for summary
    doc.setLineWidth(1);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 10;
    
    // Summary header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ORDER SUMMARY', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    
    // Summary content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Subtotal
    doc.text('Subtotal (Machine Prices):', 15, yPosition);
    doc.text(`Rs. ${formatNumberWithCommas(subtotal)}`, pageWidth - 15, yPosition, { align: 'right' });
    yPosition += 6;
    
    // VAT details (if applicable)
    if (vatAmount > 0) {
      doc.text('VAT (Per-Item Calculation):', 15, yPosition);
      doc.text(`Rs. ${formatNumberWithCommas(vatAmount)}`, pageWidth - 15, yPosition, { align: 'right' });
      yPosition += 6;
    }
    
    // Discount (if applicable)
    if (discountAmount > 0) {
      doc.text(`Discount (${saleData.discountPercentage || 0}%):`, 15, yPosition);
      doc.text(`-Rs. ${formatNumberWithCommas(discountAmount)}`, pageWidth - 15, yPosition, { align: 'right' });
      yPosition += 6;
    }
    
    // Extra charges (if applicable)
    const extrasTotal = saleData.extras ? saleData.extras.reduce((sum, extra) => sum + (extra.amount || 0), 0) : 0;
    if (extrasTotal > 0) {
      doc.text('Extra Charges:', 15, yPosition);
      doc.text(`Rs. ${formatNumberWithCommas(extrasTotal)}`, pageWidth - 15, yPosition, { align: 'right' });
      yPosition += 6;
    }
    
    // Draw line above total
    doc.setLineWidth(0.5);
    doc.line(15, yPosition, pageWidth - 15, yPosition);
    yPosition += 8;
    
    // Total amount
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('FINAL TOTAL:', 15, yPosition);
    doc.text(`Rs. ${formatNumberWithCommas(finalTotal)}`, pageWidth - 15, yPosition, { align: 'right' });
    yPosition += 15;
    
    // Amount in words
    checkNewPage(10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const amountInWords = numberToWords(Math.floor(finalTotal));
    doc.text(`SAY TOTAL: ${amountInWords}`, 15, yPosition);
    yPosition += 15;
    
    // Check for new page before terms and conditions
    checkNewPage(60);
    
    // Payment terms
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT TERMS:', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 6;
    doc.text('100% by cash on delivery or by a cheque draw to the account name of', 15, yPosition);
    yPosition += 5;
    doc.text('"P.E.INDUSTRIAL AUTOMATION (PVT).LTD"', 15, yPosition);
    yPosition += 10;
    
    // Warranty information (variable per item)
    doc.setFont('helvetica', 'bold');
    doc.text('WARRANTY:', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    yPosition += 6;
    
    // Check if all items have the same warranty
    const warranties = saleData.items.map(item => {
      const cartItem = saleData.cart?.find(c => c.machineId === item.machineId) || item;
      return cartItem.warrantyMonths || item.warrantyMonths || 12;
    });
    
    const uniqueWarranties = [...new Set(warranties)];
    
    if (uniqueWarranties.length === 1) {
      doc.text(`${uniqueWarranties[0]} MONTHS FROM INVOICE DATE FOR ALL ITEMS`, 15, yPosition);
    } else {
      doc.text('VARIABLE WARRANTY PERIODS AS SPECIFIED PER ITEM:', 15, yPosition);
      yPosition += 5;
      saleData.items.forEach((item, index) => {
        const cartItem = saleData.cart?.find(c => c.machineId === item.machineId) || item;
        const warranty = cartItem.warrantyMonths || item.warrantyMonths || 12;
        const itemName = (cartItem.name || item.name || 'Item').substring(0, 30);
        doc.text(`• ${itemName}: ${warranty} months`, 20, yPosition);
        yPosition += 4;
      });
    }
    yPosition += 10;
    
    // Bank details
    checkNewPage(30);
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
    checkNewPage(25);
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
    
    // Add footer to all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text('Note: Computer Generated Document', 15, pageHeight - 10);
      if (i > 1) {
        doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
    }
    
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