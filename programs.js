/* ═══════════════════════════════════════════════
   Programs Module - Static Programs with Detail Modal
   ═══════════════════════════════════════════════ */
(function(){
'use strict';

function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}

var PROGRAMS=[
  {
    name:'برنامج إيران جواً',
    duration:'9 ليالي / 11 يوم',
    departure:'كل سبت وخميس',
    shortDesc:'رحلة دينية سياحية إلى شمال إيران (رشت، فومن، قلعة رودخان، ماسولة، بندر انزلي) ومدينة مشهد المقدسة وقم. المسار: رشت - فومن - قلعة رودخان - ماسولة - بندر انزلي - مشهد - قم.',
    priceText:'للاستفسار عن السعر مراسلتنا',
    img:'images/صورة الشركة.png',
    fullDesc:'<strong>أولاً: برنامج شمال إيران (مدينة رشت وما حولها)</strong><br><br>'
      +'<strong>الفنادق المتاحة للإقامة:</strong><br>'
      +'• فندق آرام (ثلاث نجوم) في مدينة فومن<br>'
      +'• أو فندق خَزَر (أربع نجوم) في مدينة رودسر<br><br>'
      +'<strong>اليوم الأول:</strong> الوصول إلى مدينة رشت وتسليم الغرف بعد الساعة 2 ظهراً، وبعدها الذهاب في جولة سياحية في الأسواق المحلية.<br><br>'
      +'<strong>اليوم الثاني:</strong> الانطلاق صباحاً في جولات سياحية إلى قلعة رودخان، الصعود إلى أعلى القلعة والتمتع بالمناظر الخلابة والمياه الجارية من أعلى.<br><br>'
      +'<strong>اليوم الثالث (صباحاً):</strong> الانطلاق إلى قرية ماسولة الجبلية والاستمتاع بالسير في أزقتها الحجرية الفريدة والمشي في وسط أجواء الضباب والوديان.<br>'
      +'<strong>اليوم الثالث (عصراً):</strong> الذهاب إلى مدينة بندر انزلي السياحية وركوب القارب السريع داخل مستنقع انزلي (التالاب) لرؤية زهور اللوتس المائية والطيور المهاجرة.<br><br>'
      +'<strong>ثانياً: برنامج مدينة مشهد المقدسة</strong><br><br>'
      +'مكان الإقامة: فندق انتخاب (أربع نجوم)<br><br>'
      +'<strong>اليوم الأول:</strong> الوصول إلى الفندق واستلام الغرف بعد الساعة 2 ظهراً، وبعدها التوجه لزيارة الإمام علي بن موسى الرضا (عليه السلام).<br><br>'
      +'<strong>اليوم الثاني:</strong> الذهاب صباحاً في جولة سياحية في مدينة طرقبة (جايدراه) والتمتع بالألعاب، ومن ثم الذهاب إلى مطعم عنبران (بلبل) لتناول وجبة الغداء، ثم التوجه إلى حديقة وكيل آباد وحديقة الحيوانات.<br><br>'
      +'<strong>اليوم الثالث:</strong> الذهاب صباحاً إلى حديقة بارك ملت، وعصراً رحلة اختيارية (حسب رغبة المسافر) إلى المدينة المائية.<br><br>'
      +'<strong>اليوم الرابع:</strong> الذهاب إلى حديقة باغ مشهد لمشاهدة أجمل المناظر والاستمتاع بالألعاب، وبعدها وقت حر للمسافرين.<br><br>'
      +'<strong>ثالثاً: مدينة قم</strong><br><br>'
      +'<strong>اليوم الأول:</strong> الوصول إلى الفندق استراحة وبعدها زيارة السيدة معصومة (عليها السلام).<br><br>'
      +'<strong>اليوم الثاني:</strong> زيارة بيت النور وجمكران.<br><br>'
      +'<strong>اليوم الثالث:</strong> مغادرة قم.<br><br>'
      +'<strong>ملاحظات هامة:</strong><br>'
      +'• في حالة رغبة المسافر في الحصول على الطعام (ثلاث وجبات بنظام بوفيه) داخل الفندق، يضاف مبلغ 100 دولار.<br>'
      +'• في حال ترك المسافر للجروب لأي سبب كان، لا يتم إرجاع المبلغ له.'
  },
  {
    name:'برنامج إيران براً',
    duration:'11 يوم',
    departure:'كل سبت وخميس',
    shortDesc:'رحلة برية دينية سياحية إلى قم، مشهد ونيشابور بباصات VIP حديثة ومكيفة. تشمل 3 وجبات طعام في كل المناطق.',
    priceText:'للاستفسار عن السعر مراسلتنا',
    img:'images/صورة الشركة.png',
    fullDesc:'رحلة إلى قم .. مشهد .. نيشابور<br><br>'
      +'<strong>مدة الرحلة:</strong> 11 يوماً<br>'
      +'<strong>قم:</strong> 3 ليالي (4 أيام) مع طعام 3 وجبات<br>'
      +'<strong>مشهد:</strong> 3 ليالي (4 أيام) مع طعام 3 وجبات<br>'
      +'<strong>المواصلات:</strong> باصات VIP حديثة ومكيفة<br><br>'
      +'<strong>البرنامج بالتفصيل:</strong><br><br>'
      +'<strong>اليوم الأول:</strong> التجمع عند باب الشركة والانطلاق نحو الحدود العراقية الإيرانية ومنها إلى مدينة قم المقدسة.<br><br>'
      +'<strong>اليوم الثاني:</strong> الوصول واستلام الغرف.<br><br>'
      +'<strong>اليوم الثالث:</strong> التجمع داخل صالة الفندق والخروج لأداء المزارات: مسجد جمكران، مقام الإمام المهدي (عجل الله فرجه الشريف) وبئر الأمنيات.<br><br>'
      +'<strong>اليوم الرابع:</strong> تسليم الغرف والاتجاه إلى مدينة مشهد المقدسة.<br><br>'
      +'<strong>اليوم الخامس:</strong> الوصول، استلام الغرف والاستراحة، وعصراً الخروج لزيارة الإمام الرضا (عليه السلام).<br><br>'
      +'<strong>اليوم السادس:</strong> التوجه لزيارة ياسر وناصر، وشراء العسل الطبيعي، باغ وحش، باغ مشهد، حديقة الدينصورات، كوسنگي.<br><br>'
      +'<strong>اليوم السابع:</strong> يوم حر لكم.<br><br>'
      +'<strong>اليوم الثامن:</strong> تسليم الغرف والتوجه إلى مدينة قم المقدسة مروراً بمدينة نيشابور لزيارة قدم الإمام الرضا (عليه السلام) وأخذ الماء المبارك من العين التي انبثقت تحت قدمه الشريفة.<br><br>'
      +'<strong>اليوم التاسع:</strong> الوصول إلى مدينة قم المقدسة، استلام الغرف والاستراحة، وعصراً جولة حرة للتسوق.<br><br>'
      +'<strong>اليوم العاشر:</strong> صباحاً زيارة الوداع لحرم السيدة معصومة (عليها السلام)، وبعد الظهر تسليم الغرف والتوجه إلى أرض الوطن.<br><br>'
      +'<strong>اليوم الحادي عشر:</strong> الوصول إلى أرض الوطن.<br><br>'
      +'<strong>ملاحظات هامة:</strong><br>'
      +'• النقل باصات حديثة ومكيفة VIP رجال أعمال.<br>'
      +'• السكن ثلاثي ورباعي، ومن يرغب بغرفة مزدوجة إضافة 50 ألف للنفر، غرفة سنكل 100 ألف.<br>'
      +'• استلام الغرف الساعة 1 ظهراً لغرض التنظيف.<br>'
      +'• عند تسليم الجواز للشركة لا يجوز سحبه، وعند سحبه يستقطع نصف المبلغ بسبب الحجز المسبق.<br>'
      +'• الشركة توفر مترجم للمراجعة في الأمور الطبية مجاناً.'
  },
  {
    name:'برنامج العمرة',
    duration:'10 ليالي',
    departure:'كل أسبوع',
    shortDesc:'رحلة عمرة مع شركة بركات المناسك. 7 ليالي في مكة المكرمة (منطقة محبس الجن) و3 ليالي في المدينة المنورة (مركزية). تشمل تذكرة طيران وإقامة في فنادق 4 نجوم وجميع التنقلات.',
    priceText:'للاستفسار عن السعر مراسلتنا',
    img:'images/صورة الشركة.png',
    fullDesc:'<strong>🕋 رحلة العمرة المباركة</strong><br>'
      +'مع شركة بركات المناسك للسفر والسياحة<br><br>'
      +'<strong>✈️ رحلات طيران - كل أسبوع</strong><br><br>'
      +'<strong>🏨 الإقامة في فنادق راقية ومميزة:</strong><br>'
      +'• <strong>المدينة المنورة:</strong> 3 ليالي - سكن في المدينة مركزية<br>'
      +'• <strong>مكة المكرمة:</strong> 7 ليالي - منطقة محبس الجن (فنادق: ميسان الملتزم، تاج بارك، الجزيرة)<br><br>'
      +'<strong>✅ البرنامج يشمل:</strong><br>'
      +'• تذكرة الطائرة ذهاب وإياب<br>'
      +'• الإقامة في مستوى فنادق 4 نجوم مميزة<br>'
      +'• جميع التنقلات السياحية والدينية بين مكة والمدينة<br>'
      +'• إشراف كامل على مدار الرحلة<br>'
      +'• كادر إداري<br>'
      +'• زيارة جميع المزارات الدينية في مكة والمدينة<br>'
      +'• إرشاد ديني متخصص معكم طوال الرحلة<br><br>'
      +'<strong>🎁 هدايا مجانية لكل معتمر:</strong><br>'
      +'• حقيبة سفر كبيرة + حقيبة يد كتف<br>'
      +'• إحرام رجالي + وشاح نسائي<br>'
      +'• شفقات رجالية ونسائية<br><br>'
      +'<strong>🚌 رحلات البر متوفرة أيضاً بأسعار تنافسية</strong>'
  }
];

function openProgramModal(idx){
  var d=PROGRAMS[idx];
  if(!d)return;
  var overlay=document.getElementById('programModal');
  if(!overlay)return;
  document.getElementById('pmName').textContent=d.name;
  document.getElementById('pmDuration').textContent=d.duration;
  document.getElementById('pmDeparture').textContent=d.departure;
  document.getElementById('pmPrice').innerHTML=d.priceText;
  document.getElementById('pmDesc').innerHTML=d.fullDesc||d.shortDesc;
  var waText='أرغب بالاستفسار عن '+esc(d.name);
  document.getElementById('pmWALink').href='https://wa.me/9647744641155?text='+encodeURIComponent(waText);
  overlay.classList.add('show');
  document.body.classList.add('no-scroll');
}

function closeProgramModal(){
  var overlay=document.getElementById('programModal');
  if(!overlay)return;
  overlay.classList.remove('show');
  document.body.classList.remove('no-scroll');
}

function loadPrograms(){
  var grid=document.getElementById('programsGrid');
  if(!grid)return;
  grid.innerHTML='';

  PROGRAMS.forEach(function(d,i){
    var card=document.createElement('div');
    card.className='prg-card';
    card.setAttribute('data-anim','fade-up');
    card.style.cursor='pointer';
    card.innerHTML='<div class="prg-img-wrap">'
      +'<img src="'+esc(d.img)+'" alt="'+esc(d.name)+'" loading="lazy">'
      +'<span class="prg-badge prg-badge-avail">متاح للحجز</span>'
      +'</div>'
      +'<div class="prg-body">'
      +'<h3 class="prg-name">'+esc(d.name)+'</h3>'
      +'<div class="prg-meta">'
      +'<span class="prg-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'+esc(d.duration)+'</span>'
      +'<span class="prg-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'+esc(d.departure)+'</span>'
      +'</div>'
      +'<p class="prg-desc">'+esc(d.shortDesc)+'</p>'
      +'<div class="prg-footer">'
      +'<span class="prg-price" style="font-size:14px;color:var(--g500);font-weight:500">'+esc(d.priceText)+'</span>'
      +'</div>'
      +'</div>';
    card.addEventListener('click',function(){openProgramModal(i)});
    grid.appendChild(card);
  });
  if(typeof window.reinitAnimations==='function')window.reinitAnimations();
}

document.addEventListener('DOMContentLoaded',function(){
  var overlay=document.getElementById('programModal');
  if(overlay){
    overlay.addEventListener('click',function(e){
      if(e.target===overlay||e.target.classList.contains('pm-close'))closeProgramModal();
    });
  }
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape')closeProgramModal();
  });
});

loadPrograms();
window.loadPrograms=loadPrograms;
window.openProgramModal=openProgramModal;
window.closeProgramModal=closeProgramModal;

})();
