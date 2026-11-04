import json, pathlib, csv
root=pathlib.Path(__file__).resolve().parents[1]
base=json.loads((root/'catalog_48.json').read_text())
# Editorial descriptions are original. They are not copied from source sites.
# Fields per entry: ko overview | en overview | ko highlight(s) | en highlight(s) | ko tip | en tip | estimated minutes.
rows={
'A01':('비엔나 구시가지의 중심에 서 있는 고딕 대성당입니다. 화려한 지붕과 높은 첨탑이 도시의 상징입니다.','The Gothic cathedral at the heart of Vienna’s Old Town is known for its patterned roof and soaring spire.','모자이크 지붕·대성당 외관 / 내부 예배당·전망대','Tiled roof and Gothic facade / Interior chapels and tower views','종교행사 중 관광 입장이 제한될 수 있어 내부 관람 시간을 확인하세요.','Sightseeing access may be restricted during services; check visitor hours.',30,90),
'A02':('합스부르크 왕가가 오랫동안 사용한 거대한 궁전 단지입니다. 광장과 여러 박물관이 이어져 있습니다.','This vast former Habsburg palace complex connects grand squares with museums and imperial collections.','헬덴플라츠·미하엘러 광장 / 시시 박물관·황실 보물관','Heldenplatz and Michaelerplatz / Sisi Museum and Imperial Treasury','호프부르크 외관 산책과 내부 박물관은 서로 다른 방문 활동입니다.','The palace grounds and each indoor museum are separate visits.',30,120),
'A03':('합스부르크의 여름 궁전입니다. 화려한 궁전 내부와 넓은 바로크 정원을 함께 즐길 수 있습니다.','The Habsburg summer palace combines ornate state rooms with sweeping Baroque gardens.','궁전 내부·프랑스식 정원 / 글로리에테 전망','State rooms and formal gardens / Gloriette viewpoint','궁전과 정원의 운영시간이 다르며 일부 특별 정원은 유료입니다.','Palace rooms and gardens have different opening times; special garden attractions may charge admission.',90,240),
'A04':('바로크 궁전 안에서 클림트 작품과 오스트리아 미술을 감상할 수 있는 대표 미술관입니다.','A major art museum in a Baroque palace, celebrated for Klimt and Austrian art.','클림트 《키스》·궁전 전시실 / 궁전 앞 정원','Klimt’s The Kiss and palace galleries / Palace gardens','상벨베데레 입장권은 일반적으로 시간대 선택이 필요합니다.','Ordinary Upper Belvedere admission generally requires a selected entry slot.',70,150),
'A05':('링 거리의 유명한 오페라 극장입니다. 공연을 보거나 날짜가 맞으면 가이드 투어에 참여할 수 있습니다.','The landmark opera house on the Ringstrasse welcomes visitors for performances and selected guided tours.','극장 외관·로비 / 공연 관람·가이드 투어','Opera house facade and foyer / Performance or guided tour','공연과 가이드 투어는 시간·요금이 서로 다릅니다.','Performances and guided tours have separate schedules and tickets.',20,160),
'A06':('유럽의 거장 회화와 황실 소장품이 집결한 대형 미술관입니다. 건물 내부도 볼거리입니다.','This grand museum houses European master paintings and historic imperial collections in an impressive building.','브뤼헐·베르메르 회화 / 중앙 계단과 돔','Bruegel and Vermeer paintings / Grand staircase and dome','관심 작품을 미리 고르면 짧은 일정에도 효율적입니다.','Choose a few must-see works in advance for a shorter visit.',90,210),
'A07':('알베르티나는 판화와 회화, 특별전으로 사랑받는 도심 미술관입니다.','Albertina is a central Vienna museum known for graphic art, paintings and temporary exhibitions.','전시실·황실 방 / 알베르티나 테라스 전망','Galleries and historic rooms / Albertina terrace views','알베르티나 모던과 본관은 다른 장소입니다.','Albertina Modern is a different venue from the main Albertina.',60,150),
'A08':('오스트리아 국립도서관의 프룽크잘은 웅장한 바로크 장서 공간입니다.','The Austrian National Library’s State Hall is a magnificent Baroque library interior.','천장 프레스코·대형 서가 / 역사적 지구본','Ceiling frescoes and towering shelves / Historic globes','실제 도서관 이용 공간과 관광용 프룽크잘은 구분됩니다.','The tourist State Hall is separate from the library’s reading facilities.',30,75),
'A09':('카를스플라츠 남쪽의 바로크 성당으로, 커다란 돔과 두 개의 기념기둥이 인상적입니다.','This Baroque church beside Karlsplatz is recognized by its dome and monumental columns.','성당 전면과 연못 / 돔과 내부 장식','Facade and reflecting pool / Dome and interior decoration','예배와 콘서트에 따라 방문 가능 시간이 달라질 수 있습니다.','Worship and concerts may affect sightseeing access.',20,75),
'A10':('신고딕 양식의 시청사와 넓은 광장입니다. 계절별 행사와 시장이 열리기도 합니다.','Vienna’s Neo-Gothic City Hall stands over a large square that hosts seasonal events and markets.','시청사 외관·광장 / 건물 내부 투어','Neo-Gothic facade and square / Guided interior tour','시청 앞 광장 행사와 시청사 내부 투어는 별도로 확인하세요.','Check events on the square and guided tours inside separately.',20,65),
'A11':('옛 궁정 마구간을 활용한 문화지구로, 미술관과 카페, 야외 휴식공간이 모여 있습니다.','A lively cultural quarter combining art museums, cafes and outdoor gathering spaces.','MQ 안뜰·야외 의자 / 레오폴트 미술관','MQ courtyards and outdoor seating / Leopold Museum','야외 공간을 둘러보는 것과 미술관 입장은 별개입니다.','Outdoor courtyards and museum admission are separate activities.',30,120),
'A12':('프라터의 상징인 역사적인 대관람차로 비엔나 시가지의 전망을 감상할 수 있습니다.','The historic Giant Ferris Wheel in the Prater offers elevated views over Vienna.','대관람차 탑승 / 프라터 놀이공원 풍경','Ferris wheel ride / Prater amusement-park atmosphere','탑승시간 외에 대기시간을 별도로 고려하세요.','Allow time for queues in addition to the ride itself.',30,90),
'A13':('직선 대신 곡선과 다채로운 색채를 사용한 훈데르트바서의 주거건물입니다.','An eye-catching residential building designed with bright colors, irregular lines and planted terraces.','외부 파사드·거리 사진 / 근처 쿤스트하우스','Colorful exterior and street views / Nearby Kunst Haus Wien','실제 주민이 거주하므로 건물 내부 관광은 불가능합니다.','This is an occupied residential building; interiors are not open to tourists.',15,35),
'A14':('식재료와 간식, 식당이 이어지는 비엔나의 대표적인 시장입니다.','Vienna’s best-known market combines produce stalls, specialty foods and eateries.','시장 골목·간식 시식 / 주변 카페와 레스토랑','Market lanes and food stalls / Nearby cafes and restaurants','일요일에는 일반 시장 점포가 대부분 쉬지만 식당은 별도로 영업할 수 있습니다.','Most market stalls close on Sundays, although restaurants may operate separately.',30,90),
'A15':('슈테판 대성당과 호프부르크 사이에 있는 우아한 구시가지 거리입니다.','An elegant pedestrian street linking the cathedral area with the imperial heart of the Old Town.','페스트 기념탑 / 전통 건물과 쇼윈도','Plague Column / Historic facades and shop windows','저녁에는 쇼핑보다 거리 풍경과 건축 사진을 즐기기 좋습니다.','In the evening, enjoy street views even after shops close.',20,50),
'A16':('요한 슈트라우스 황금 동상으로 유명한 도심 공원입니다.','A city-center park especially known for its gilded Johann Strauss monument.','슈트라우스 동상 / 산책길과 연못','Johann Strauss monument / Paths and pond','도보 휴식이 필요한 날 짧게 끼워 넣기 좋습니다.','An easy stop to add when your itinerary needs a break.',20,60),
'B01':('황후 엘리자베트의 생애와 궁중 생활을 소개하는 호프부르크의 박물관입니다.','This Hofburg museum explores Empress Elisabeth’s life and imperial court culture.','황후 관련 유물 / 황실 아파트','Objects associated with Empress Elisabeth / Imperial Apartments','호프부르크 산책과 구분해 내부 관람시간을 확보하세요.','Reserve separate time for the museum beyond a walk through Hofburg.',60,105),
'B02':('합스부르크 왕가의 왕관과 보물, 역사적 예술품을 전시하는 박물관입니다.','A museum of Habsburg crowns, ceremonial treasures and historic objects.','황실 왕관·보물 / 보물관 전시실','Imperial crowns and regalia / Treasury galleries','2026년부터 시간대 입장 조건이 있으므로 예약 시각을 확인하세요.','Timed entry applies; confirm your chosen admission slot.',45,100),
'B03':('리피차너 말의 전통적인 승마예술을 소개하는 호프부르크의 명소입니다.','A Hofburg institution preserving the classical horsemanship tradition of the Lipizzaner horses.','아침 훈련·공연 / 바로크 승마홀','Morning exercise or performance / Baroque riding hall','훈련·공연·투어는 날짜와 시간표가 다릅니다.','Training, shows and tours have different schedules.',45,120),
'B04':('비엔나 모더니즘과 에곤 실레 작품으로 유명한 미술관입니다.','An art museum celebrated for Viennese Modernism, especially works by Egon Schiele.','에곤 실레 작품 / 비엔나 모더니즘 전시','Egon Schiele works / Viennese Modernism exhibitions','일반적인 화요일 휴관과 특별개관일을 함께 확인하세요.','Check the usual Tuesday closure and holiday exceptions.',60,120),
'B05':('광물·동물·공룡·운석 등을 폭넓게 전시하는 자연사박물관입니다.','An extensive natural history museum featuring minerals, animals, dinosaurs and meteorites.','공룡·동물 전시 / 유서 깊은 박물관 건축','Dinosaurs and animal collections / Historic museum interior','어린이 동반 가족은 긴 방문시간을 고려하세요.','Families may want more time than a quick museum stop.',90,180),
'B06':('황금색 월계수 돔으로 유명한 빈 분리파 전시관입니다.','The Secession exhibition building is renowned for its golden laurel-leaf dome.','황금 돔·건물 외관 / 클림트 베토벤 프리즈','Golden dome and facade / Klimt’s Beethoven Frieze','전시 교체 기간에는 일부 공간이 닫힐 수 있습니다.','Some galleries may close during exhibition changeovers.',30,90),
'B07':('훈데르트바서의 예술과 친환경 사상을 만나는 미술관입니다.','An art museum devoted to Hundertwasser’s work and environmental ideas.','훈데르트바서 상설전 / 개성 있는 건축','Hundertwasser permanent exhibition / Unconventional architecture','훈데르트바서하우스에서 걸어서 연결하기 좋습니다.','Pairs well with a walk to nearby Hundertwasserhaus.',60,120),
'B08':('모차르트가 비엔나에서 거주했던 보존 아파트가 포함된 음악 박물관입니다.','A music museum that includes Mozart’s preserved Vienna apartment.','모차르트 거주 공간 / 작곡가의 비엔나 생활','Mozart’s apartment / His life in Vienna','슈테판 대성당과 가까우며 한국어 오디오 가이드를 제공합니다.','Close to Stephansdom; a Korean audio guide is available.',60,100),
'B09':('소리의 원리와 비엔나 음악사를 직접 체험할 수 있는 참여형 박물관입니다.','An interactive sound museum exploring acoustics and Vienna’s musical history.','가상 지휘 체험 / 소리 실험·작곡가 전시','Virtual conducting / Sound experiments and composer exhibits','실내 체험이 많아 비 오는 날에도 좋은 선택입니다.','A useful rainy-day option with many hands-on exhibits.',75,150),
'B10':('황금홀로 유명한 비엔나의 대표적인 클래식 공연장입니다.','A celebrated classical concert hall, famous for its Golden Hall.','황금홀 공연 / 건물 가이드 투어','Golden Hall concerts / Guided building tours','공연 티켓과 건물 투어는 별도로 예약합니다.','Concert tickets and building tours are booked separately.',30,150),
'B11':('오케스트라와 다양한 실내악 공연이 열리는 유서 깊은 콘서트홀입니다.','A historic concert venue hosting orchestras, chamber music and other performances.','대공연장 / 백스테이지 가이드 투어','Main concert hall / Backstage guided tour','공연 일정과 백스테이지 투어 시간을 구분하세요.','Check concert schedules and backstage tour dates separately.',45,150),
'B12':('쇤브룬 궁전 공원에 있는 동물원으로 다양한 동물을 만날 수 있습니다.','The zoo in the Schönbrunn grounds is home to a wide range of animals.','다양한 동물·전시관 / 숲과 정원','Animal habitats and houses / Landscaped grounds','동물원에는 별도 유료 입장권이 필요하며 꽤 긴 시간이 듭니다.','The zoo has separate admission and is best given a generous time block.',120,240),
'B13':('쇤브룬 공원 언덕 위의 전망 건물로 궁전과 비엔나 시내를 조망할 수 있습니다.','A hilltop structure in Schönbrunn Park with views over the palace gardens and city.','궁전 축선 전망 / 글로리에테 카페','Palace-and-garden panorama / Gloriette café','공원 산책과 전망 테라스 유료 입장은 서로 다릅니다.','A park walk and the paid viewing terrace are separate options.',30,90),
'B14':('오스트리아의 기술·산업·과학을 체험 전시로 소개하는 박물관입니다.','A hands-on museum exploring Austrian technology, industry and science.','교통·에너지 전시 / 어린이 체험','Transport and energy exhibits / Family interactives','가족 여행이라면 쇤브룬 인근의 실내 일정으로 좋습니다.','A family-friendly indoor option near Schönbrunn.',90,180),
'B15':('도나우강과 도시 전체를 내려다보는 전망탑입니다.','An observation tower overlooking the Danube and Vienna’s wider skyline.','전망대·도시 파노라마 / 카페·레스토랑','Observation deck and panorama / Café and restaurant','강풍·날씨에 따라 야외 전망대 또는 슬라이드가 제한될 수 있습니다.','Weather or strong winds may restrict outdoor areas or the slide.',45,90),
'B16':('비엔나 숲과 포도밭이 이어지는 언덕 전망지입니다.','A hilltop viewpoint on the edge of the Vienna Woods, overlooking vineyards and the city.','도시 전망 / 포도밭과 산책길','City panorama / Vineyard trails','도심에서 이동하는 데 시간이 걸려 반나절 코스에 어울립니다.','Allow travel time from the center; best for a longer outing.',45,150),
'B17':('링 거리의 장대한 국회의사당에서 오스트리아 민주주의를 알아볼 수 있습니다.','A monumental Ringstrasse building offering insights into Austrian parliamentary democracy.','고전주의 건축 / 방문자 센터·투어','Classical architecture / Visitor center and tours','입장 시 신분증과 보안검사가 필요할 수 있습니다.','Bring identification and allow for security checks.',35,100),
'B18':('음악가들의 기념묘와 큰 공원 같은 묘역으로 알려진 비엔나 중앙묘지입니다.','Vienna’s vast Central Cemetery is known for composers’ honorary graves and park-like grounds.','음악가 묘역 / 묘지 교회와 산책로','Musicians’ honorary graves / Cemetery church and avenues','2번 출입구를 기준으로 동선을 계획하면 편리합니다.','Gate 2 is a practical starting point for visiting major sights.',60,150),
'C01':('그라벤 근처에 있는 화려한 바로크 교회입니다.','An ornate Baroque church tucked just off Vienna’s Graben.','금빛 내부장식 / 둥근 돔','Gilded interior / Oval dome','예배 시간을 존중하고 내부 방문 가능 여부를 확인하세요.','Respect services and check when sightseeing is allowed.',15,40),
'C02':('유대인 공동체의 역사를 돌아볼 수 있는 구시가지의 조용한 광장입니다.','A quiet Old Town square connected to the history of Vienna’s Jewish community.','홀로코스트 기념물 / 광장과 주변 역사 건물','Holocaust memorial / Historic square and buildings','기념공간은 조용히 관람하는 것이 좋습니다.','Visit the memorial respectfully.',15,35),
'C03':('정오에 역사 인물들이 차례로 등장하는 아르누보 양식의 장식 시계입니다.','An Art Nouveau clock whose historical figures parade at noon.','12시 인물 행렬 / 호허 마르크트 광장','Noon figure parade / Hoher Markt square','정오 행사 관람을 원하면 몇 분 일찍 도착하세요.','Arrive a few minutes before noon for the display.',10,25),
'C04':('호프부르크 미하엘러문 앞의 광장으로 궁전 출입구와 유적이 보입니다.','A square before Hofburg’s Michaeler Gate, with imperial architecture and historic remains.','미하엘러문 / 광장 유적과 건물','Michaeler Gate / Archaeological remains and facades','호프부르크·그라벤 동선에 함께 넣기 좋습니다.','An easy addition to a Hofburg–Graben walk.',15,35),
'C05':('구시가지에 있는 고딕 교회로, 대형 모자이크 복제품이 알려져 있습니다.','A Gothic church in the Old Town known for a large mosaic reproduction.','고딕 건축 / 실내 모자이크','Gothic architecture / Interior mosaic','예배·행사에 따라 내부 접근이 달라질 수 있습니다.','Interior access may change during services or events.',15,40),
'C06':('미술사박물관과 자연사박물관 사이에 자리한 기념 광장입니다.','A grand square between the art-history and natural-history museums.','마리아 테레지아 기념상 / 대칭적인 박물관 건물','Maria Theresa monument / Twin museum facades','두 박물관을 방문하는 날 사진 촬영 지점으로 좋습니다.','A natural photo stop between the two museums.',15,35),
'C07':('장미 정원과 고전주의 건축으로 알려진 호프부르크 옆 공원입니다.','A formal garden beside Hofburg, known for its roses and classical architecture.','장미 정원 / 테세우스 신전','Rose garden / Theseus Temple','겨울에는 문 닫는 시간이 빠르니 계절별 시간을 확인하세요.','Winter closing times are earlier; check seasonal park hours.',20,50),
'C08':('호프부르크 남쪽의 아늑한 정원으로 모차르트 기념상이 있습니다.','A tranquil garden south of Hofburg featuring a Mozart monument.','모차르트 기념상 / 산책로와 정원','Mozart monument / Shaded garden paths','알베르티나와 호프부르크 사이의 쉬어가는 장소입니다.','A convenient rest stop between Albertina and Hofburg.',20,45),
'C09':('좁은 골목과 아기자기한 집들이 이어지는 역사적인 동네입니다.','A charming quarter of narrow lanes, historic houses and small restaurants.','조약돌 골목 / 카페·작은 상점','Cobblestone lanes / Cafes and small shops','겨울에는 크리스마스 마켓 분위기로 유명하지만 개최일은 확인하세요.','A popular Christmas-market area; check current event dates.',30,75),
'C10':('비엔나의 아르누보 건축가 오토 바그너가 설계한 옛 도시철도 역사 건물입니다.','An Art Nouveau former Stadtbahn station pavilion designed by Otto Wagner.','황금 장식의 파빌리온 / 철도 건축 역사','Decorative pavilion exterior / Transport design history','내부 전시관은 계절 운영하며 겨울철 휴관하므로 외관 관람과 구분하세요.','The small exhibition is seasonal and closes in winter; the exterior is a different visit.',15,45),
'C11':('현지 식재료와 작은 식당을 만날 수 있는 레오폴트슈타트의 시장입니다.','A neighborhood market in Leopoldstadt with food stalls and eateries.','토요일 농산물 시장 / 동네 카페','Saturday farmers’ market / Neighborhood cafés','일반 시장 점포와 식당의 영업시간이 다릅니다.','Market stalls and restaurants operate on different schedules.',30,70),
'C12':('도나우 운하를 따라 스트리트 아트와 카페, 산책로가 이어지는 지역입니다.','A waterfront stretch of the Danube Canal known for street art, cafés and walking paths.','강변 산책 / 벽화·스트리트 아트','Canal-side walk / Murals and street art','구간이 길어 출발·도착 위치를 정해서 방문하세요.','Choose a specific section; the canal route is long.',30,90),
'C13':('나무가 울창한 바로크 정원으로, 역사적인 방공탑도 보입니다.','A spacious historic garden with shaded walks and striking wartime flak towers.','가로수 길·정원 / 방공탑 외관','Tree-lined paths and gardens / Flak-tower exteriors','정원은 계절별로 출입문 개폐시간이 달라집니다.','Garden gates follow seasonal opening and closing times.',30,90),
'C14':('도나우강 위 길게 이어진 녹지섬으로 산책과 자전거, 여름 휴식에 좋습니다.','A long green island in the Danube popular for walks, cycling and summer recreation.','강변 전망 / 산책·자전거 길','River views / Walking and cycling paths','섬이 매우 길므로 방문할 구간과 접근역을 먼저 정하세요.','Pick an island section and transit stop in advance.',45,150),
}
assert len(rows)==48
# independently checked source pages; not an assertion that all prices/hours remain valid.
sources={
'B01':'https://www.sisimuseum-hofburg.at/en/visitor-information/opening-hours/',
'B02':'https://www.kaiserliche-schatzkammer.at/besuchen/besucherinformation/oeffnungszeiten-eintrittspreise/',
'B03':'https://www.srs.at/en/visitor-information/vienna/opening-hours',
'B04':'https://www.leopoldmuseum.org/en/visit/opening-hours',
'B05':'https://www.nhm.at/en/information',
'B06':'https://secession.at/en/information_tickets',
'B08':'https://www.mozarthausvienna.at/en/plan-your-visit',
'B09':'https://www.hdm.at/faq/',
'B10':'https://www.musikverein.com/en/fuehrungen/',
'B11':'https://konzerthaus.at/en/guided-tours',
'B12':'https://www.zoovienna.at/besuch-und-tickets/besucherinformation/',
'B13':'https://www.schoenbrunn.at/en/visitor-information/opening-times',
'B14':'https://www.technischesmuseum.at/visitor-info/lang/en',
'B15':'https://www.donauturm.at/en/opening-times/',
'B16':'https://www.wien.info/en/livable-vienna/parks-green-spaces/kahlenberg-337908',
'B17':'https://www.parlament.gv.at/en/experience/visitor-center',
'B18':'https://www.bestattungwien.at/web/friedhofe-wien/visit-vienna-central-cemetery',
'C03':'https://www.wien.info/en/see-do/sights-from-a-to-z/anker-clock-339092',
'C07':'https://www.wien.info/en/livable-vienna/parks-green-spaces/parks-gardens-center-354980',
'C08':'https://www.wien.info/en/livable-vienna/parks-green-spaces/parks-gardens-center-354980',
'C10':'https://www.wienmuseum.at/otto_wagner_pavillon_karlsplatz',
'C11':'https://www.wien.gv.at/freizeit/karmelitermarkt-1020',
'C13':'https://www.bundesgaerten.at/augarten/oeffnungszeiten.html',
}
# price mode: free_public / free_exterior_paid_inside / ticketed / free_outdoors / verify
public_types={'C02','C04','C06','C09','C12','C14','A15'}
parks={'A16','C07','C08','C13','B16','A11'}
ticketed={'A04','A06','A07','A08','A12','B01','B02','B04','B05','B06','B07','B08','B09','B12','B14','B15'}
combined={'A01','A03','A05','A09','A10','A13','B03','B10','B11','B13','B17','B18','C01','C05','C10'}
status_note={
 'A03':('궁전 내부 2026.11.3~2027.3.31 기본 08:30–17:00. 일부 날짜 연장, 정원 계절별 운영.','Palace 08:30–17:00 in the 2026/27 winter period, with exceptions; park hours vary by season.'),
 'A04':('미술관 09:00–18:00, 일반 입장 시간대 선택.','Museum 09:00–18:00; ordinary admission requires a selected time slot.'),
 'B01':('일반 09:00–17:30, 2026.10.6~11.18 공사 기간 단축운영 공지.','Normally 09:00–17:30; shorter hours were announced for 6 Oct–18 Nov 2026.'),
 'B02':('화요일 제외 09:00–17:30. 2026.4.1부터 예약된 시간대 입장 필요.','09:00–17:30 except Tuesdays; timed admission required from April 2026.'),
 'B04':('통상 화요일 휴관, 다른 날 10:00–18:00. 특별일 예외 확인.','Usually closed Tuesdays, otherwise 10:00–18:00; check holiday exceptions.'),
 'B05':('화요일 휴관, 수요일 20:00까지, 나머지 기본 09:00–18:00.','Closed Tuesdays; Wednesdays until 20:00, otherwise generally 09:00–18:00.'),
 'B06':('월요일 휴관, 화~일 10:00–18:00. 전시 교체 기간 유의.','Closed Mondays; Tue–Sun 10:00–18:00, subject to exhibition changes.'),
 'B08':('매일 10:00–19:00, 마지막 입장 18:30.','Daily 10:00–19:00; last entry 18:30.'),
 'B09':('매일 10:00–22:00, 마지막 입장 21:00.','Daily 10:00–22:00; last entry 21:00.'),
 'B10':('가이드 투어·공연은 개별 일정 확인. 일·공휴일 일반 투어 없음.','Tours and performances depend on the event calendar; no regular Sunday/holiday tours.'),
 'B11':('공연·투어 일정별 운영. 투어 약 60분.','Opening depends on event/tour schedule; guided tours last about 60 minutes.'),
 'B12':('매일 09:00 개장, 폐장 16:30–18:30 계절별 변동.','Opens daily at 09:00; seasonal closing between 16:30 and 18:30.'),
 'B13':('공원 산책은 별도, 유료 전망 테라스는 계절 운영. 겨울에 일반 테라스 운영 제한 가능.','The park is separate from the paid observation terrace, which operates seasonally.'),
 'B14':('월~금 09:00–18:00, 주말·공휴일 10:00–18:00. 휴관일 예외.','Mon–Fri 09:00–18:00; weekends/holidays 10:00–18:00, with closed-date exceptions.'),
 'B15':('전망대 시간·마지막 엘리베이터 시간은 날짜별 확인.','Check date-specific observation deck hours and last lift ascent.'),
 'B17':('방문자센터 월~토 운영, 일·공휴일 휴관. 무료 투어는 예약 일정 확인.','Visitor centre generally Mon–Sat; closed Sundays/holidays. Guided tours require calendar checking.'),
 'B18':('11~2월 08:00–17:00, 계절에 따라 운영시간 변동.','Nov–Feb 08:00–17:00; seasonal hours otherwise.'),
 'C03':('매일 정오 12:00 인물 행렬(실외), 강림절에는 추가 행사 가능.','Outdoor figure parade at noon daily; additional Advent display may take place.'),
 'C07':('11~2월 07:00–17:30, 봄·여름은 운영시간 연장.','Nov–Feb 07:00–17:30; later closing in warmer seasons.'),
 'C08':('11~2월 07:00–17:30, 봄·여름은 운영시간 연장.','Nov–Feb 07:00–17:30; later closing in warmer seasons.'),
 'C10':('내부 전시관은 보통 5~9월 금~일, 10~4월 겨울 휴관. 외관은 별개.','Exhibition typically Fri–Sun May–September; closed during winter. Exterior is separate.'),
 'C11':('일반 점포 최대 운영시간 월~금 06:00–21:00, 토 06:00–18:00. 개별 점포 실제 시간 차이.','Maximum stall hours Mon–Fri 06:00–21:00, Sat 06:00–18:00; actual stall hours vary.'),
 'C13':('정원은 일출·계절에 따라 개폐시간 변동, 겨울 대체로 07:00–17:30.','Garden opening follows the season; roughly 07:00–17:30 in winter.'),
}
# numeric tariff only when officially checked on a named institution page, not every place
price_examples={
'A04':('성인 일반권 공식 페이지에 €23 표시(조회일 기준, 변동 가능)','Official page displayed €23 regular adult entry when reviewed; subject to change.'),
'B02':('성인 온라인 €16 / 현장 €18 (조회일 기준)','Adult online €16 / on-site €18 as checked; subject to change.'),
'B05':('성인 일반 €18 (조회일 기준)','Regular adult €18 as checked; subject to change.'),
'B06':('성인 일반 €13 (조회일 기준)','Regular adult €13 as checked; subject to change.'),
'B14':('성인 일반 €18 (조회일 기준)','Regular adult €18 as checked; subject to change.'),
}
booking={
'A03':('내부 관람 사전 예약 권장','Advance booking recommended for palace rooms'),
'A04':('일반 입장 시간대 선택 필요','Timed entry generally required'),
'A05':('공연·투어는 일정별 예약','Performance/tour booking by date'),
'A12':('혼잡 시 온라인 예약 권장','Online booking useful at busy times'),
'B01':('사전 구매 권장, 단체 예약 규정 확인','Pre-purchase advised; group rules differ'),
'B02':('시간대 예약 입장 필수','Timed-entry reservation required'),
'B03':('훈련·공연·투어 일정 예약','Reserve specific training/show/tour'),
'B10':('공연·투어 날짜별 예약','Concert and tour tickets are date-specific'),
'B11':('공연·투어 날짜별 예약','Concert and tour tickets are date-specific'),
'B17':('무료 투어 온라인 예약·신분증 확인','Book free tour online; bring ID'),
}
# Additional individually located institution/tourist pages checked on 2026-11-04.
sources.update({
 'B07':'https://www.wien.info/en/art-culture/museums-exhibitions/top-museums/kunsthauswien-350408?pp=1',
 'C01':'https://www.peterskirche.at/',
 'C02':'https://www.wien.info/en/judenplatz-133050',
 'C04':'https://www.wien.info/en/art-culture/imperial-sights/imperial-palace-348842',
 'C05':'https://www.wien.info/en/art-culture/architecture/churches-343056',
 'C06':'https://www.wien.info/en/art-culture/imperial-sights/imperial-palace-348842',
 'C09':'https://www.wien.info/en/dine-drink/markets/spittelberg-wining-dining-359532',
 'C12':'https://www.wien.info/en/livable-vienna/water-in-vienna/relaxing-on-the-danube-356414',
 'C14':'https://www.wien.info/en/see-do/families/outdoor/danube-island-344064',
})
status_note.update({
 'B07':('미술관 일반 개방 10:00–18:00. 특별전은 날짜별 확인.','Museum generally open 10:00–18:00; check exhibitions by date.'),
 'C01':('교회 월~금 08:00–19:00, 주말 09:00–19:00. 예배·행사 시 변경 가능.','Church Mon–Fri 08:00–19:00, weekends 09:00–19:00; services may alter access.'),
})
content=[]
for c in base:
    id=c['id']; ko,en,high_ko,high_en,tip_ko,tip_en,lo,hi=rows[id]
    price_type='free_public' if id in public_types else 'free_grounds' if id in parks else 'paid_indoor' if id in ticketed else 'mixed' if id in combined else 'verify'
    official_url=sources.get(id) or c.get('source')
    # official record status is tied to direct web checks; never treat as reservation availability
    p={
        'id':id, 'name_ko':c['ko'],'name_de':c['de'],'name_en':c.get('en') or c['de'], 'region':c['region'],'tier':c['tier'],'category':c['category'],'tags':c['tags'],
        'overview_ko':ko,'overview_en':en,'highlights_ko':high_ko.split(' / '),'highlights_en':high_en.split(' / '),
        'tip_ko':tip_ko,'tip_en':tip_en,'estimated_minutes_min':lo,'estimated_minutes_max':hi,'duration_basis':'ViennaNow editorial estimate; not official',
        'price_type':price_type,'price_example_ko':price_examples.get(id,(None,None))[0], 'price_example_en':price_examples.get(id,(None,None))[1],
        'hours_note_ko':status_note.get(id,(c.get('summary') or '개별 시설 운영시간·휴관일은 공식 사이트에서 확인해야 합니다.','Check the official source for opening hours and closures.'))[0],
        'hours_note_en':status_note.get(id,(c.get('summary') or '개별 시설 운영시간·휴관일은 공식 사이트에서 확인해야 합니다.','Check the official source for opening hours and closures.'))[1],
        'booking_ko':booking.get(id,('방문 방식에 따라 예약·입장 조건 확인 필요','Check booking requirements for your chosen visit.'))[0],
        'booking_en':booking.get(id,('방문 방식에 따라 예약·입장 조건 확인 필요','Check booking requirements for your chosen visit.'))[1],
        'official_url':official_url,
        'official_link_status':'direct_source_checked' if id in sources or (id.startswith('A') and c.get('source')) else 'not_yet_attached',
        'operational_status':'partially_checked' if id in status_note or c.get('schedule_reviewed') else 'needs_date_check',
        'planner_eligible':bool(c.get('is_planner_enabled')), 'last_editorial_review':'2026-11-04'
    }
    # Do not claim an operational source even if some general sightseeing descriptions were checked
    content.append(p)
(root/'content_48.json').write_text(json.dumps(content,ensure_ascii=False,indent=2)+'\n')
(root/'public'/'content_48.json').write_text(json.dumps(content,ensure_ascii=False,indent=2)+'\n')
with (root/'CONTENT_AUDIT_48.csv').open('w',newline='',encoding='utf-8-sig') as f:
    writer=csv.writer(f);writer.writerow(['id','name_ko','official_url','official_link_status','operational_status','planner_eligible','price_type','duration_range_minutes','review_date'])
    for p in content:writer.writerow([p['id'],p['name_ko'],p['official_url'] or '',p['official_link_status'],p['operational_status'],p['planner_eligible'],p['price_type'],f"{p['estimated_minutes_min']}-{p['estimated_minutes_max']}",p['last_editorial_review']])
print('Created',len(content),'records',sum(p['official_link_status']=='direct_source_checked' for p in content),'direct source links',sum(p['operational_status']=='partially_checked' for p in content),'operational partially checked')
