/* ═══════════════════════════════════════════════
   Programs Module - Firestore + Static Fallback + Modal
   ═══════════════════════════════════════════════ */
(function(){
'use strict';

try{firebase.initializeApp(firebaseConfig)}catch(e){}
var db=firebase.firestore();

function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}

var pstLabels={
  available:'متاح للحجز',almost_full:'المقاعد أوشكت على النفاد',
  full:'اكتمل العدد',coming_soon:'قريباً',ended:'انتهى البرنامج'
};
var pstClasses={
  available:'prg-badge-avail',almost_full:'prg-badge-almost',
  full:'prg-badge-full',coming_soon:'prg-badge-soon',ended:'prg-badge-ended'
};
var transLabels={flight:'طيران',bus:'باصات VIP',mixed:'النقل المختلط'};
var seedAttempted=false;

/* ── Program cover images lookup (name-based matching) ── */
var PROGRAM_COVER_DIR='images/صور برامج الشركة/';
var PROGRAM_COVER_FILES=[
  'برنامج ايران جوا.png',
  'برنامج ايران برا .png',
  'برنامج العمرة.png'
];
var programCoverMap={};
PROGRAM_COVER_FILES.forEach(function(f){
  var nameNoExt=f.replace(/\.\w+$/,'').trim();
  var normalized=nameNoExt.replace(/[\u064B-\u065F]/g,'').replace(/[إأآ]/g,'ا').trim();
  programCoverMap[normalized]=PROGRAM_COVER_DIR+f;
});

function getProgramCover(programName){
  if(!programName)return null;
  var normalized=programName.replace(/[\u064B-\u065F]/g,'').replace(/[إأآ]/g,'ا').trim();
  if(programCoverMap[normalized])return programCoverMap[normalized];
  for(var key in programCoverMap){
    if(normalized.indexOf(key)!==-1||key.indexOf(normalized)!==-1)
      return programCoverMap[key];
  }
  console.warn('Image not found for:',programName);
  return null;
}

/* ═══════════════════════════════════════════════════
   STATIC FALLBACK — used when Firestore is empty
   ═══════════════════════════════════════════════════ */
var FALLBACK_PROGRAMS=[
  {
    name:'برنامج إيران جواً',
    duration:'9 ليالي / 11 يوم',
    departure:'كل سبت وخميس',
    shortDesc:'رحلة دينية سياحية إلى شمال إيران (رشت، فومن، قلعة رودخان، ماسولة، بندر انزلي) ومدينة مشهد المقدسة وقم. المسار: رشت - فومن - قلعة رودخان - ماسولة - بندر انزلي - مشهد - قم.',
    price:'للاستفسار عن السعر مراسلتنا',
    img:'images/صور برامج الشركة/برنامج ايران جوا.png',
    programStatus:'available',
    transport:'flight',
    meals:'اختياري (3 وجبات بوفيه +100 دولار)',
    servicesIncluded:'• تذكرة طيران ذهاب وإياب<br>• الإقامة في فنادق 3-4 نجوم<br>• جولات سياحية حسب البرنامج<br>• مرشد سياحي',
    notes:'• في حالة رغبة المسافر في الحصول على الطعام (ثلاث وجبات بنظام بوفيه) داخل الفندق، يضاف مبلغ 100 دولار.<br>• في حال ترك المسافر للجروب لأي سبب كان، لا يتم إرجاع المبلغ له.',
    fullDesc:'برنامج شمال إيران (مدينة رشت وما حولها)<br><br>'
      +'<strong>الفنادق المتاحة للإقامة:</strong><br>'
      +'• فندق آرام (ثلاث نجوم) في مدينة فومن<br>'
      +'• أو فندق خَزَر (أربع نجوم) في مدينة رودسر<br><br>'
      +'<strong>اليوم الأول:</strong> الوصول إلى مدينة رشت وتسليم الغرف بعد الساعة 2 ظهراً، وبعدها الذهاب في جولة سياحية في الأسواق المحلية.<br><br>'
      +'<strong>اليوم الثاني:</strong> الانطلاق صباحاً في جولات سياحية إلى قلعة رودخان، الصعود إلى أعلى القلعة والتمتع بالمناظر الخلابة والمياه الجارية من أعلى.<br><br>'
      +'<strong>اليوم الثالث (صباحاً):</strong> الانطلاق إلى قرية ماسولة الجبلية والاستمتاع بالسير في أزقتها الحجرية الفريدة والمشي في وسط أجواء الضباب والوديان.<br>'
      +'<strong>اليوم الثالث (عصراً):</strong> الذهاب إلى مدينة بندر انزلي السياحية وركوب القارب السريع داخل مستنقع انزلي (التالاب) لرؤية زهور اللوتس المائية والطيور المهاجرة.<br><br>'
      +'<strong>برنامج مدينة مشهد المقدسة</strong><br>'
      +'مكان الإقامة: فندق انتخاب (أربع نجوم)<br><br>'
      +'<strong>اليوم الأول:</strong> الوصول إلى الفندق واستلام الغرف بعد الساعة 2 ظهراً، وبعدها التوجه لزيارة الإمام علي بن موسى الرضا (عليه السلام).<br><br>'
      +'<strong>اليوم الثاني:</strong> الذهاب صباحاً في جولة سياحية في مدينة طرقبة (جايدراه) والتمتع بالألعاب، ومن ثم الذهاب إلى مطعم عنبران (بلبل) لتناول وجبة الغداء، ثم التوجه إلى حديقة وكيل آباد وحديقة الحيوانات.<br><br>'
      +'<strong>اليوم الثالث:</strong> الذهاب صباحاً إلى حديقة بارك ملت، وعصراً رحلة اختيارية (حسب رغبة المسافر) إلى المدينة المائية.<br><br>'
      +'<strong>اليوم الرابع:</strong> الذهاب إلى حديقة باغ مشهد لمشاهدة أجمل المناظر والاستمتاع بالألعاب، وبعدها وقت حر للمسافرين.<br><br>'
      +'<strong>مدينة قم</strong><br><br>'
      +'<strong>اليوم الأول:</strong> الوصول إلى الفندق استراحة وبعدها زيارة السيدة معصومة (عليها السلام).<br><br>'
      +'<strong>اليوم الثاني:</strong> زيارة بيت النور وجمكران.<br><br>'
      +'<strong>اليوم الثالث:</strong> مغادرة قم.',
    timeline:[
      {title:'الوصول إلى رشت',desc:'الوصول إلى مدينة رشت وتسليم الغرف بعد الساعة 2 ظهراً، وبعدها الذهاب في جولة سياحية في الأسواق المحلية.'},
      {title:'قلعة رودخان',desc:'الانطلاق صباحاً في جولات سياحية إلى قلعة رودخان، الصعود إلى أعلى القلعة والتمتع بالمناظر الخلابة والمياه الجارية من أعلى.'},
      {title:'ماسولة وبندر انزلي',desc:'صباحاً: الانطلاق إلى قرية ماسولة الجبلية والاستمتاع بالسير في أزقتها الحجرية الفريدة والمشي في وسط أجواء الضباب والوديان. عصراً: الذهاب إلى مدينة بندر انزلي السياحية.'},
      {title:'مشهد - الوصول',desc:'الوصول إلى مدينة مشهد المقدسة. استلام الغرف وبعدها التوجه لزيارة الإمام علي بن موسى الرضا (عليه السلام).'},
      {title:'جولة في طرقبة',desc:'الذهاب صباحاً في جولة سياحية في مدينة طرقبة (جايدراه) والتمتع بالألعاب، ومن ثم الذهاب إلى مطعم عنبران (بلبل) لتناول وجبة الغداء، ثم التوجه إلى حديقة وكيل آباد وحديقة الحيوانات.'},
      {title:'حديقة بارك ملت',desc:'الذهاب صباحاً إلى حديقة بارك ملت، وعصراً رحلة اختيارية (حسب رغبة المسافر) إلى المدينة المائية.'},
      {title:'باغ مشهد',desc:'الذهاب إلى حديقة باغ مشهد لمشاهدة أجمل المناظر والاستمتاع بالألعاب، وبعدها وقت حر للمسافرين.'},
      {title:'قم - الوصول',desc:'الوصول إلى مدينة قم. استراحة وبعدها زيارة السيدة معصومة (عليها السلام).'},
      {title:'بيت النور وجمكران',desc:'زيارة بيت النور وجمكران.'},
      {title:'مغادرة قم',desc:'مغادرة قم والعودة إلى أرض الوطن.'}
    ]
  },
  {
    name:'برنامج إيران براً',
    duration:'11 يوم',
    departure:'كل سبت وخميس',
    shortDesc:'رحلة برية دينية سياحية إلى قم، مشهد ونيشابور بباصات VIP حديثة ومكيفة. تشمل 3 وجبات طعام في كل المناطق.',
    price:'للاستفسار عن السعر مراسلتنا',
    img:'images/صور برامج الشركة/برنامج ايران برا .png',
    programStatus:'available',
    transport:'bus',
    meals:'3 وجبات يومياً',
    servicesIncluded:'• النقل بباصات VIP حديثة ومكيفة<br>• الإقامة مع 3 وجبات طعام<br>• مشرف طوال الرحلة<br>• مترجم للمراجعة في الأمور الطبية مجاناً',
    notes:'• النقل باصات حديثة ومكيفة VIP رجال أعمال.<br>• السكن ثلاثي ورباعي، ومن يرغب بغرفة مزدوجة إضافة 50 ألف للنفر، غرفة سنكل 100 ألف.<br>• استلام الغرف الساعة 1 ظهراً لغرض التنظيف.<br>• عند تسليم الجواز للشركة لا يجوز سحبه، وعند سحبه يستقطع نصف المبلغ بسبب الحجز المسبق.<br>• الشركة توفر مترجم للمراجعة في الأمور الطبية مجاناً.',
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
      +'<strong>اليوم الحادي عشر:</strong> الوصول إلى أرض الوطن.',
    timeline:[
      {title:'التجمع والانطلاق',desc:'التجمع عند باب الشركة والانطلاق نحو الحدود العراقية الإيرانية ومنها إلى مدينة قم المقدسة.'},
      {title:'الوصول إلى قم',desc:'الوصول إلى قم واستلام الغرف.'},
      {title:'مزارات قم',desc:'التجمع داخل صالة الفندق والخروج لأداء المزارات: مسجد جمكران، مقام الإمام المهدي (عجل الله فرجه الشريف) وبئر الأمنيات.'},
      {title:'التوجه إلى مشهد',desc:'تسليم الغرف والاتجاه إلى مدينة مشهد المقدسة.'},
      {title:'مشهد - الوصول',desc:'الوصول، استلام الغرف والاستراحة، وعصراً الخروج لزيارة الإمام الرضا (عليه السلام).'},
      {title:'زيارة ياسر وناصر',desc:'التوجه لزيارة ياسر وناصر، وشراء العسل الطبيعي، باغ وحش، باغ مشهد، حديقة الدينصورات، كوسنگي.'},
      {title:'يوم حر',desc:'يوم حر لكم.'},
      {title:'العودة إلى قم عبر نيشابور',desc:'تسليم الغرف والتوجه إلى مدينة قم المقدسة مروراً بمدينة نيشابور لزيارة قدم الإمام الرضا (عليه السلام) وأخذ الماء المبارك من العين التي انبثقت تحت قدمه الشريفة.'},
      {title:'قم - استراحة',desc:'الوصول إلى مدينة قم المقدسة، استلام الغرف والاستراحة، وعصراً جولة حرة للتسوق.'},
      {title:'زيارة الوداع',desc:'صباحاً زيارة الوداع لحرم السيدة معصومة (عليها السلام)، وبعد الظهر تسليم الغرف والتوجه إلى أرض الوطن.'},
      {title:'العودة إلى الوطن',desc:'الوصول إلى أرض الوطن.'}
    ]
  },
  {
    name:'برنامج العمرة',
    duration:'10 ليالي',
    departure:'كل أسبوع',
    shortDesc:'رحلة عمرة مع شركة بركات المناسك. 7 ليالي في مكة المكرمة (منطقة محبس الجن) و3 ليالي في المدينة المنورة (مركزية). تشمل تذكرة طيران وإقامة في فنادق 4 نجوم وجميع التنقلات.',
    price:'للاستفسار عن السعر مراسلتنا',
    img:'images/صور برامج الشركة/برنامج العمرة.png',
    programStatus:'available',
    transport:'flight',
    meals:'بوفيه مفتوح',
    servicesIncluded:'• تذكرة الطائرة ذهاب وإياب<br>• الإقامة في مستوى فنادق 4 نجوم مميزة<br>• جميع التنقلات السياحية والدينية بين مكة والمدينة<br>• إشراف كامل على مدار الرحلة<br>• كادر إداري<br>• زيارة جميع المزارات الدينية في مكة والمدينة<br>• إرشاد ديني متخصص معكم طوال الرحلة<br><br>🎁 هدايا مجانية لكل معتمر:<br>• حقيبة سفر كبيرة + حقيبة يد كتف<br>• إحرام رجالي + وشاح نسائي<br>• شفقات رجالية ونسائية',
    notes:'• رحلات البر متوفرة أيضاً بأسعار تنافسية',
    hotelMakkah:'ميسان الملتزم / تاج بارك / الجزيرة (منطقة محبس الجن)',
    hotelMadinah:'فندق في المنطقة المركزية',
    fullDesc:'🕋 رحلة العمرة المباركة<br>'
      +'مع شركة بركات المناسك للسفر والسياحة<br><br>'
      +'✈️ رحلات طيران - كل أسبوع<br><br>'
      +'🏨 الإقامة في فنادق راقية ومميزة:<br>'
      +'• <strong>المدينة المنورة:</strong> 3 ليالي - سكن في المدينة مركزية<br>'
      +'• <strong>مكة المكرمة:</strong> 7 ليالي - منطقة محبس الجن (فنادق: ميسان الملتزم، تاج بارك، الجزيرة)<br><br>'
      +'✅ البرنامج يشمل:<br>'
      +'• تذكرة الطائرة ذهاب وإياب<br>'
      +'• الإقامة في مستوى فنادق 4 نجوم مميزة<br>'
      +'• جميع التنقلات السياحية والدينية بين مكة والمدينة<br>'
      +'• إشراف كامل على مدار الرحلة<br>'
      +'• كادر إداري<br>'
      +'• زيارة جميع المزارات الدينية في مكة والمدينة<br>'
      +'• إرشاد ديني متخصص معكم طوال الرحلة',
    timeline:[
      {title:'المغادرة إلى المدينة',desc:'المغادرة من أرض الوطن إلى المدينة المنورة.'},
      {title:'المدينة المنورة',desc:'الوصول إلى المدينة المنورة واستلام الغرف وزيارة المسجد النبوي الشريف.'},
      {title:'المدينة - مزارات',desc:'زيارة المزارات الدينية في المدينة المنورة.'},
      {title:'التوجه إلى مكة',desc:'التوجه إلى مكة المكرمة والاستعداد للعمرة.'},
      {title:'مكة المكرمة',desc:'أداء مناسك العمرة والطواف والسعي.'},
      {title:'مكة - مزارات',desc:'زيارة المزارات الدينية في مكة المكرمة.'},
      {title:'مكة - عبادة',desc:'وقت حر للعبادة والتسوق.'},
      {title:'مكة - عبادة',desc:'وقت حر للعبادة.'},
      {title:'الاستعداد للعودة',desc:'الاستعداد للعودة إلى أرض الوطن.'},
      {title:'العودة',desc:'العودة إلى أرض الوطن.'}
    ]
  }
];

/* ── Shared: populate modal from data object ── */
function populateModal(d,fallbackIdx){
  if(!d){console.error('❌ Program data not found.');return}
  console.log('📝 Populating modal for:',d.name);
  var heroImg=document.getElementById('pmHeroImg');
  var imgUrl=getProgramCover(d.name)||d.img||d.mainImage||'';
  heroImg.src=imgUrl;
  heroImg.alt=d.name||'';
  console.log('🖼️ Image URL:',imgUrl);
  heroImg.onerror=function(){
    console.warn('⚠️ صورة البرنامج غير موجودة في المودال:',d.name);
    this.style.display='none';
  };
  console.log('✅ Image Loaded:',imgUrl);
  document.getElementById('pmName').textContent=d.name||'';
  var badge=document.getElementById('pmStatusBadge');
  var pst=d.programStatus||'available';
  badge.textContent=pstLabels[pst]||pst;
  badge.className='pm-badge '+(pstClasses[pst]||'prg-badge-avail');

  document.getElementById('pmDuration').textContent=d.duration||d.departure||'';
  document.getElementById('pmDeparture').textContent=d.departureDate||d.departure||'';

  var transportEl=document.getElementById('pmTransport');
  var transportRow=document.getElementById('pmTransportRow');
  if(d.transport){
    transportEl.textContent=transLabels[d.transport]||d.transport;
    transportRow.style.display='';
  }else transportRow.style.display='none';

  var hotelsEl=document.getElementById('pmHotels');
  var hotelsRow=document.getElementById('pmHotelsRow');
  var h=[];
  if(d.hotelMakkah)h.push('مكة: '+d.hotelMakkah);
  if(d.hotelMadinah)h.push('المدينة: '+d.hotelMadinah);
  if(h.length){hotelsEl.innerHTML=h.join('<br>');hotelsRow.style.display=''}
  else hotelsRow.style.display='none';

  var mealsEl=document.getElementById('pmMeals');
  var mealsRow=document.getElementById('pmMealsRow');
  if(d.meals){mealsEl.textContent=d.meals;mealsRow.style.display=''}
  else mealsRow.style.display='none';

  document.getElementById('pmDesc').innerHTML=d.fullDesc||d.shortDesc||'';

  var servicesEl=document.getElementById('pmServices');
  var servicesSec=document.getElementById('pmServicesSection');
  if(d.servicesIncluded){
    servicesEl.innerHTML=d.servicesIncluded;
    servicesSec.style.display='';
  }else servicesSec.style.display='none';

  var timelineEl=document.getElementById('pmTimeline');
  var timelineSec=document.getElementById('pmTimelineSection');
  var tl=d.timeline||[];
  if(tl.length){
    var tHtml='';
    tl.forEach(function(t,i){
      tHtml+='<div class="pm-tl-item">'
        +'<div class="pm-tl-num">'+(i+1)+'</div>'
        +'<div class="pm-tl-content">'
        +(t.title?'<h4 class="pm-tl-title">'+esc(t.title)+'</h4>':'')
        +'<p class="pm-tl-desc">'+(t.desc||t.description||'')+'</p>'
        +'</div></div>';
    });
    timelineEl.innerHTML=tHtml;
    timelineSec.style.display='';
  }else timelineSec.style.display='none';

  var galleryEl=document.getElementById('pmGalleryGrid');
  var gallerySec=document.getElementById('pmGallerySection');
  var gl=d.gallery||[];
  if(gl.length){
    var gHtml='';
    gl.forEach(function(u){
      gHtml+='<div class="pm-gallery-item"><img src="'+esc(u)+'" alt="" loading="lazy"></div>';
    });
    galleryEl.innerHTML=gHtml;
    gallerySec.style.display='';
  }else gallerySec.style.display='none';

  var notesEl=document.getElementById('pmNotes');
  var notesSec=document.getElementById('pmNotesSection');
  if(d.notes){
    notesEl.innerHTML=d.notes;
    notesSec.style.display='';
  }else notesSec.style.display='none';

  document.getElementById('pmPrice').textContent=d.price||'للاستفسار عن السعر';

  var msg='السلام عليكم\nأرغب بحجز:\n'+(d.name||'')+'\nالاسم:\nرقم الهاتف:\nعدد المسافرين:\nوشكراً.';
  document.getElementById('pmWALink').href='https://wa.me/9647744641155?text='+encodeURIComponent(msg);

  var pst=d.programStatus||'available';
  var waBtn=document.getElementById('pmWALink');
  if(pst==='full'||pst==='ended'){
    waBtn.textContent='اكتملت المقاعد';
    waBtn.classList.remove('btn-accent');
    waBtn.classList.add('btn-disabled');
    waBtn.removeAttribute('href');
    waBtn.style.pointerEvents='none';
    waBtn.style.background='var(--g400)';
    waBtn.style.cursor='not-allowed';
  }else if(pst==='coming_soon'){
    waBtn.textContent='قريباً';
    waBtn.classList.remove('btn-accent');
    waBtn.classList.add('btn-disabled');
    waBtn.removeAttribute('href');
    waBtn.style.pointerEvents='none';
    waBtn.style.background='var(--gold)';
    waBtn.style.cursor='not-allowed';
  }else{
    waBtn.textContent='استفسار عن البرنامج';
    waBtn.classList.add('btn-accent');
    waBtn.classList.remove('btn-disabled');
    waBtn.href='https://wa.me/9647744641155?text='+encodeURIComponent(msg);
    waBtn.style.pointerEvents='';
    waBtn.style.background='';
    waBtn.style.cursor='';
  }

  var overlay=document.getElementById('programModal');
  overlay.classList.add('show');
  document.body.classList.add('no-scroll');
  document.documentElement.style.overflow='hidden';
}

function showLoading(){
  document.getElementById('pmHeroImg').src='';
  document.getElementById('pmName').textContent='';
  document.getElementById('pmStatusBadge').textContent='';
  document.getElementById('pmDuration').textContent='';
  document.getElementById('pmDeparture').textContent='';
  document.getElementById('pmTransport').textContent='';
  document.getElementById('pmHotels').textContent='';
  document.getElementById('pmMeals').textContent='';
  document.getElementById('pmDesc').innerHTML='';
  document.getElementById('pmServices').innerHTML='';
  document.getElementById('pmTimeline').innerHTML='';
  document.getElementById('pmGalleryGrid').innerHTML='';
  document.getElementById('pmNotes').innerHTML='';
  document.getElementById('pmPrice').textContent='';
  document.getElementById('pmServicesSection').style.display='none';
  document.getElementById('pmTimelineSection').style.display='none';
  document.getElementById('pmGallerySection').style.display='none';
  document.getElementById('pmNotesSection').style.display='none';
  document.getElementById('pmTransportRow').style.display='none';
  document.getElementById('pmHotelsRow').style.display='none';
  document.getElementById('pmMealsRow').style.display='none';
}

function closeProgramModal(){
  var overlay=document.getElementById('programModal');
  if(!overlay)return;
  overlay.classList.remove('show');
  overlay.classList.remove('pm-anim');
  document.body.classList.remove('no-scroll');
  document.documentElement.style.overflow='';
}

/* ── Open modal from Firestore (docId) ── */
function openProgramModal(docId){
  console.log('🔍 Program ID:',docId);
  var overlay=document.getElementById('programModal');
  if(!overlay)return;
  showLoading();
  overlay.classList.add('show');
  document.body.classList.add('no-scroll');
  document.documentElement.style.overflow='hidden';

  db.collection('programs').doc(docId).get().then(function(snap){
    if(!snap.exists){console.warn('⚠️ Program not found in Firestore:',docId);closeProgramModal();return}
    var d=snap.data();
    console.log('📦 Program Data:',d);
    d.img=d.mainImage;
    db.collection('programs').doc(docId).collection('timeline').orderBy('order','asc').get().then(function(tlSnap){
      var timeline=[];
      tlSnap.docs.forEach(function(tl){timeline.push({title:tl.data().title,desc:tl.data().description})});
      d.timeline=timeline;
      console.log('✅ Timeline loaded:',timeline.length,'days');
      populateModal(d);
      overlay.classList.add('pm-anim');
    }).catch(function(err){
      console.warn('⚠️ Timeline fetch failed, showing program without timeline:',err.message);
      populateModal(d);
      overlay.classList.add('pm-anim');
    });
  }).catch(function(err){
    console.error('❌ Firestore fetch failed:',err.message);
    closeProgramModal()
  });
}

/* ── Open modal from fallback (index) ── */
function openProgramModalFB(idx){
  console.log('🔍 Fallback index:',idx);
  var d=FALLBACK_PROGRAMS[idx];
  if(!d){console.warn('⚠️ Program data not found at index:',idx);return}
  console.log('📦 Program Data:',d);
  var overlay=document.getElementById('programModal');
  if(!overlay)return;
  showLoading();
  overlay.classList.add('show');
  document.body.classList.add('no-scroll');
  document.documentElement.style.overflow='hidden';
  populateModal(d);
  overlay.classList.add('pm-anim');
}

/* ── Try seeding Firestore once ── */
function trySeedFirestore(){
  if(seedAttempted)return;
  seedAttempted=true;
  var seedData=FALLBACK_PROGRAMS;
  seedData.forEach(function(p){
    var data={
      name:p.name,price:p.price,shortDesc:p.shortDesc,fullDesc:p.fullDesc,
      duration:p.duration,departureDate:p.departure,
      programStatus:'available',status:'active',transport:p.transport||'',
      hotelMakkah:p.hotelMakkah||'',hotelMadinah:p.hotelMadinah||'',
      hotelStars:4,meals:p.meals||'',
      servicesIncluded:(p.servicesIncluded||'').replace(/<br>/g,'\n'),
      notes:(p.notes||'').replace(/<br>/g,'\n'),
      mainImage:p.img,days:0,nights:0,order:0,seats:50,seatsLeft:50,gallery:[],
      createdAt:new Date()
    };
    if(p===seedData[0]){data.days=11;data.nights=9;data.order=0}
    else if(p===seedData[1]){data.days=11;data.nights=10;data.order=1}
    else{data.days=10;data.nights=10;data.order=2}
    try{
      db.collection('programs').add(data).then(function(ref){
        var batch=db.batch();
        (p.timeline||[]).forEach(function(tl,i){
          batch.set(ref.collection('timeline').doc(),{
            day:i+1,title:tl.title,description:tl.desc||'',images:[],order:i
          });
        });
        batch.commit().catch(function(){});
      }).catch(function(){});
    }catch(e){}
  });
}

/* ── WhatsApp booking helper ── */
function openBookingWA(name){
  var msg='السلام عليكم\nأرغب بحجز:\n'+(name||'')+'\nالاسم:\nرقم الهاتف:\nعدد المسافرين:\nوشكراً.';
  window.open('https://wa.me/9647744641155?text='+encodeURIComponent(msg),'_blank');
}

/* ── Render cards ── */
function renderCards(list,isFirestore){
  var grid=document.getElementById('programsGrid');
  if(!grid)return;
  grid.innerHTML='';
  list.forEach(function(item,i){
    var d=isFirestore?item.data:item;
    var pst=d.programStatus||'available';
    var imgSrc=getProgramCover(d.name)||d.mainImage||d.img;
    var imgUrl=imgSrc?imgSrc+'?v='+Date.now():'';

    var showBadge=(pst==='coming_soon'||pst==='almost_full');
    var badgeText=(pst==='coming_soon'?'قريباً':(pst==='almost_full'?'اقترب موعد الانطلاق':''));

    var bookingDisabled=(pst==='full'||pst==='ended'||pst==='coming_soon');
    var bookingText=(pst==='full'?'اكتملت المقاعد':(pst==='ended'?'انتهى':(pst==='coming_soon'?'قريباً':'الحجز')));
    var bookingClass=pst==='full'?'full':(pst==='ended'?'ended':(pst==='coming_soon'?'coming':'available'));

    var card=document.createElement('div');
    card.className='prg-card';
    card.setAttribute('data-anim','fade-up');
    card.innerHTML='<div class="prg-img-wrap">'
      +'<img src="'+esc(imgUrl)+'" alt="'+esc(d.name||'')+'" loading="lazy">'
      +(showBadge?'<span class="prg-badge '+esc(pstClasses[pst])+'">'+esc(badgeText)+'</span>':'')
      +'</div>'
      +'<div class="prg-body">'
      +'<h3 class="prg-name">'+esc(d.name||'')+'</h3>'
      +'<div class="prg-meta">'
      +'<span class="prg-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>'+(d.duration||d.departureDate||d.departure||'')+'</span>'
      +'<span class="prg-meta-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'+(d.departureDate||d.departure||'')+'</span>'
      +'</div>'
      +'<p class="prg-desc">'+esc(d.shortDesc||'')+'</p>'
      +'<div class="prg-actions">'
      +'<button class="prg-action-btn prg-details-btn">عرض التفاصيل</button>'
      +'<button class="prg-action-btn prg-booking-btn '+bookingClass+'"'+(bookingDisabled?' disabled':'')+'>'+bookingText+'</button>'
      +'</div>'
      +'</div>';

    var cardImg=card.querySelector('.prg-img-wrap img');
    if(cardImg&&imgUrl){
      cardImg.onerror=(function(name){
        return function(){
          console.warn('⚠️ برنامج "'+name+'" — صورة الغلاف غير موجودة:',this.src);
          this.style.display='none';
        };
      })(d.name);
    }

    var detailsBtn=card.querySelector('.prg-details-btn');
    var bookingBtn=card.querySelector('.prg-booking-btn');

    detailsBtn.addEventListener('click',(function(idx,fs,itm){
      return function(e){
        e.stopPropagation();
        if(fs)openProgramModal(itm.id);
        else openProgramModalFB(idx);
      };
    })(i,isFirestore,item));
    if(!bookingDisabled){
      bookingBtn.addEventListener('click',(function(nm){
        return function(e){
          e.stopPropagation();
          openBookingWA(nm||'');
        };
      })(d.name));
    }

    grid.appendChild(card);
  });
  if(typeof window.reinitAnimations==='function')window.reinitAnimations();
}

/* ── Load: Firestore first, fallback to static ── */
function loadPrograms(){
  var grid=document.getElementById('programsGrid');
  if(!grid)return;
  grid.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--g400)">جاري التحميل...</div>';

  db.collection('programs').where('status','==','active').orderBy('order','asc').get().then(function(snap){
    if(!snap.docs.length){
      renderCards(FALLBACK_PROGRAMS,false);
      trySeedFirestore();
      return;
    }
    var items=[];
    snap.docs.forEach(function(doc){items.push({id:doc.id,data:doc.data()})});
    renderCards(items,true);
  }).catch(function(){
    renderCards(FALLBACK_PROGRAMS,false);
    trySeedFirestore();
  });
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
