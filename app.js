
    function addValue(id, amount) {
      const el = document.getElementById(id);
      el.value = (Number(el.value) || 0) + amount;
    }

    function resetField(id) {
      document.getElementById(id).value = '';
    }

    function calculateTax() {
      const salePrice = Number(document.getElementById('salePrice').value);
      const purchasePrice = Number(document.getElementById('purchasePrice').value);
      const agentFee = Number(document.getElementById('agentFee').value);
      const legalFee = Number(document.getElementById('legalFee').value);
      const purchaseAgentFee = Number(document.getElementById('purchaseAgentFee').value);
      const purchaseLegalFee = Number(document.getElementById('purchaseLegalFee').value);
      const taxFee = Number(document.getElementById('taxFee').value);
      const holdYears = Number(document.getElementById('holdYears').value);
      const liveYears = Number(document.getElementById('liveYears').value);
            
      
      
      
      
      
      

      
      const isPrimary = document.querySelector('input[name="isPrimary"]:checked').value === 'yes';
      const standardPrice = Number(document.getElementById('standardPrice').value);
      const isTaxExempt = isPrimary && holdYears >= 2 && standardPrice > 0 && standardPrice <= 1200000000;



      
      
      
      
      
      
      

      if (!salePrice || !purchasePrice) {
        document.getElementById('result').innerHTML = '<p>매수금액과 매도금액을 입력해 주세요.</p>';
        return;
      }

      const fixedLegalFee = 80000;
      const purchaseAgentRate = purchasePrice * 0.004; // 매수 복비 0.4%
      const saleAgentRate = (() => {
        if (salePrice < 50000000) return Math.min(salePrice * 0.006, 250000);
        if (salePrice < 200000000) return Math.min(salePrice * 0.005, 800000);
        if (salePrice < 900000000) return salePrice * 0.004;
        if (salePrice < 1200000000) return salePrice * 0.005;
        if (salePrice < 1500000000) return salePrice * 0.006;
        return salePrice * 0.007;
      })() * 1.1; // 부가세 포함
      const fixedTaxFee = purchasePrice * 0.011; // 취득세 1.1%

      const gain = salePrice - (purchasePrice + fixedTaxFee + purchaseAgentRate + purchaseLegalFee + agentFee + legalFee);

      // 1세대 1주택 요건 충족 시: 보유 4% + 거주 4%
      
      let ltsRate = 0;
      let ltsDescription = '';
      if (isPrimary && holdYears >= 3 && liveYears >= 2) {
        ltsRate = Math.min((holdYears + liveYears) * 0.04, 0.8);
        ltsDescription = `(1세대 1주택 요건 충족 시 보유 ${holdYears}년 + 거주 ${liveYears}년 × 4%) = ${(ltsRate * 100).toFixed(0)}%`;
      } else if (!isPrimary) {
        ltsRate = 0;
        ltsDescription = `1세대 1주택 요건을 충족하지 않으므로 장기보유특별공제 적용 불가`;
      } else {
        ltsRate = Math.min(holdYears * 0.02, 0.3);
        ltsDescription = `(일반공제: 보유 ${holdYears}년 × 2%) = ${(ltsRate * 100).toFixed(0)}%`;
}

      const ltsDeduction = gain * ltsRate;
      const basicDeduction = 2500000;
      const extraDeductible = saleAgentRate + fixedLegalFee + purchaseAgentRate + fixedLegalFee;
      const taxable = isTaxExempt ? 0 : Math.max(gain - ltsDeduction - basicDeduction - extraDeductible, 0);

      let tax = 0;
      let taxDetail = '';
      let taxFromBrackets = 0;
      let remain = taxable;
      if (!isTaxExempt && taxable > 0) {
        let remain = taxable;
        if (remain <= 12000000) {
          tax += remain * 0.06;
          taxFromBrackets += remain * 0.06;
          taxDetail += `- 1,200만원 이하: ${Math.round(remain * 0.06).toLocaleString()}원`;
        } else {
          const first = 12000000 * 0.06;
          tax += first;
          taxFromBrackets += first;
          taxDetail += `- 1,200만원 이하: ${Math.round(12000000 * 0.06).toLocaleString()}원<br>`;
          remain -= 12000000;
          if (remain <= 34000000) {
            tax += remain * 0.15;
            taxDetail += `- 1,200만 초과~4,600만원 이하: ${Math.round(remain * 0.15).toLocaleString()}원`;
          } else {
            const second = 34000000 * 0.15;
            tax += second;
            taxFromBrackets += second;
            taxDetail += `- 1,200만 초과~4,600만원 이하: ${Math.round(34000000 * 0.15).toLocaleString()}원<br>`;
            remain -= 34000000;
            if (remain <= 42000000) {
              const third = remain * 0.24;
              tax += third;
              taxFromBrackets += third;
              taxDetail += `- 4,600만 초과~8,800만원 이하: ${Math.round(remain * 0.24).toLocaleString()}원`;
            } else {
              const thirdFull = 42000000 * 0.24;
              tax += thirdFull;
              taxFromBrackets += thirdFull;
              taxDetail += `- 4,600만 초과~8,800만원 이하: ${Math.round(42000000 * 0.24).toLocaleString()}원<br>`;
              remain -= 42000000;
              const last = remain * 0.35;
              tax += last;
              taxFromBrackets += last;
              taxDetail += `- 8,800만 초과: ${Math.round(remain * 0.35).toLocaleString()}원`;
            }
          }
        }
      }
      const localTax = tax * 0.1;
      const totalTax = tax + localTax;

      const deductionTable = `
<table style="width:100%;margin-top:1rem;border-collapse:collapse;">
  <tr style="background:#eee;"><th style="padding:0.5rem;border:1px solid #ccc;">공제 항목</th><th style="padding:0.5rem;border:1px solid #ccc;">금액</th></tr>
  <tr><td style="padding:0.5rem;border:1px solid #ccc;">장기보유특별공제</td><td style="padding:0.5rem;border:1px solid #ccc;">${Math.round(ltsDeduction).toLocaleString()}원</td></tr>
  <tr><td style="padding:0.5rem;border:1px solid #ccc;">기본공제</td><td style="padding:0.5rem;border:1px solid #ccc;">${basicDeduction.toLocaleString()}원</td></tr>
  <tr><td style="padding:0.5rem;border:1px solid #ccc;">기타 공제 (경비)</td><td style="padding:0.5rem;border:1px solid #ccc;">${extraDeductible.toLocaleString()}원</td></tr>
</table>
`;

      document.getElementById('result').innerHTML = `
        <p><strong>1세대 1주택 비과세 여부:</strong> ${isTaxExempt ? '✅ 비과세 적용 (세금 없음)' : '❌ 과세 대상'}</p>
        <p><strong>양도차익:</strong> ${gain.toLocaleString()}원<br /><small>(= 매도가 ${salePrice.toLocaleString()} - 매수가 ${purchasePrice.toLocaleString()} - 필요경비 ${(taxFee + purchaseAgentFee + purchaseLegalFee + agentFee + legalFee).toLocaleString()})</small></p>
        <p><strong>장기보유특별공제:</strong> ${Math.round(ltsDeduction).toLocaleString()}원<br /><small>${ltsDescription}</small></p>
        <p><strong>기본공제:</strong> 2,500,000원</p>
        <p><strong>기타 공제 총합:</strong> ${extraDeductible.toLocaleString()}원<br /><small>(= 매도 복비 ${Math.round(saleAgentRate).toLocaleString()} + 매도 법무사 80,000 + 매수 복비 ${Math.round(purchaseAgentRate).toLocaleString()} + 매수 법무사 80,000)</small></p>
        <p><strong>과세표준:</strong> ${Math.round(taxable).toLocaleString()}원<br /><small>(= 양도차익 ${gain.toLocaleString()} - 장특공제 ${Math.round(ltsDeduction).toLocaleString()} - 기본공제 2,500,000 - 기타공제 ${extraDeductible.toLocaleString()})</small></p>
        ${!isTaxExempt && taxable > 0 ? `<div style="background:#fff;border:1px solid #ddd;padding:0.5rem;margin-top:1rem;"><strong>📊 세율 구간별 계산</strong><br>${taxDetail}</div>` : ''}
        <p><strong>양도소득세:</strong> ${Math.round(tax).toLocaleString()}원<br /><small>(세율구간별 합계: ${Math.round(taxFromBrackets).toLocaleString()}원)</small></p>
        <p><strong>지방소득세:</strong> ${Math.round(localTax).toLocaleString()}원</p>
        <p><strong>총 납부세액:</strong> <strong>${Math.round(totalTax).toLocaleString()}원</strong></p>
        <table style="width:100%;margin-top:1rem;border-collapse:collapse;">
          <tr style="background:#eee;"><th style="padding:0.5rem;border:1px solid #ccc;">항목</th><th style="padding:0.5rem;border:1px solid #ccc;">금액</th></tr>
          <tr><td style="padding:0.5rem;border:1px solid #ccc;">양도소득세</td><td style="padding:0.5rem;border:1px solid #ccc;">${Math.round(tax).toLocaleString()}원</td></tr>
          <tr><td style="padding:0.5rem;border:1px solid #ccc;">지방소득세</td><td style="padding:0.5rem;border:1px solid #ccc;">${Math.round(localTax).toLocaleString()}원</td></tr>
          <tr><td style="padding:0.5rem;border:1px solid #ccc;"><strong>합계</strong></td><td style="padding:0.5rem;border:1px solid #ccc;"><strong>${Math.round(totalTax).toLocaleString()}원</strong></td></tr>
        </table>
        ${deductionTable}<hr>
        <p><small>※ 본 계산기는 간이 계산기로 실제 세액은 홈택스에서 예정신고 후 확인하시기 바랍니다.</small></p>
      `;
    }
    function resetAllFields() {
    const ids = ['salePrice', 'purchasePrice', 'agentFee', 'legalFee', 'purchaseAgentFee', 'purchaseLegalFee', 'taxFee', 'holdYears', 'liveYears'];
    ids.forEach(id => resetField(id));
    document.getElementById('result').innerHTML = '';
  }
  function calculatePurchaseAgentFee() {
  const price = Number(document.getElementById('purchasePrice').value);
  if (!price) return alert('매수금액을 먼저 입력해주세요');

  let rate = 0;
  let fee = 0;
  if (price < 50000000) fee = Math.min(price * 0.006, 250000);
  else if (price < 200000000) fee = Math.min(price * 0.005, 800000);
  else if (price < 900000000) fee = price * 0.004;
  else if (price < 1200000000) fee = price * 0.005;
  else if (price < 1500000000) fee = price * 0.006;
  else fee = price * 0.007;

  fee *= 1.1; // 부가세 포함
  document.getElementById('purchaseAgentFee').value = Math.round(fee);
}
function calculateSaleAgentFee() {
  const price = Number(document.getElementById('salePrice').value);
  if (!price) return alert('매도금액을 먼저 입력해주세요');

  let fee = 0;
  if (price < 50000000) fee = Math.min(price * 0.006, 250000);
  else if (price < 200000000) fee = Math.min(price * 0.005, 800000);
  else if (price < 900000000) fee = price * 0.004;
  else if (price < 1200000000) fee = price * 0.005;
  else if (price < 1500000000) fee = price * 0.006;
  else fee = price * 0.007;

  fee *= 1.1; // 부가세 포함
  document.getElementById('agentFee').value = Math.round(fee);
}
function calculateTaxFee() {
  const price = Number(document.getElementById('purchasePrice').value);
  if (!price) return alert('매수금액을 먼저 입력해주세요');
  const isOver = document.getElementById('areaOver').checked;
  let rate = 0.011;
  if (price <= 600000000) rate = isOver ? 0.013 : 0.011;
  else if (price <= 650000000) rate = isOver ? 0.01663 : 0.01463;
  else if (price <= 700000000) rate = isOver ? 0.02037 : 0.01837;
  else if (price <= 750000000) rate = isOver ? 0.024 : 0.022;
  else if (price <= 800000000) rate = isOver ? 0.02763 : 0.02563;
  else if (price <= 850000000) rate = isOver ? 0.03137 : 0.02937;
  else if (price <= 900000000) rate = isOver ? 0.035 : 0.033;
  else rate = isOver ? 0.035 : 0.033;
  const tax = price * rate;
  document.getElementById('taxFee').value = Math.round(tax);
}
