exports.getData = function () {
    return [places, questions];
} 

const places = [
    {
        'name': "Kirche",
        'roles': [
            "Pfarrer",
            "Priester",
            "Gläubiger",
            "Bischoff",
            "ein Beichter",
            "ein Asylsuchender"
        ]
    },  
    {
        'name': "Kloster",
        'roles': [
            "Abt",
            "Mönch",
            "Schreiber",
            "Brauer",
            "Gärtner",
            "der Küchenmeister",
            "ein Novize"
        ]
    },    
    {
        'name': "Taverne",
        'roles': [
            "Wirt",
            "die Wache",
            "Soldat",
            "ein Säufer",
            "Ritter",
            "die Schankmaid",
            "ein Meuchler",
            "Schausteller",
            "der Küchenknabe"
        ]
    },    
    {
        'name': "Schlachtfeld",
        'roles': [
            "Fußsoldat",
            "Vasall",
            "Fahnenträger",
            "Bogenschütze",
            "der Heerführer",
            "der König",
            "Belagerungsspezialist",
            "Ritter",
            "Söldner",
            "ein Desateur",
            "ein Verwundeter"        
        ]
    },    
    {
        'name': "Thronsaal",
        'roles': [
            "ein Bittsteller",
            "die Wache",
            "ein Bediensteter",
            "Hofnarr",
            "Mundschenk",
            "Leibwächter",
            "Berater",
            "der König",
            "Ritter",
            "der Thronfolger"
        ]
    },    
    {
        'name': "Stallungen",
        'roles': [
            "der Knecht",
            "ein Reiter",
            "Ritter",
            "der Stallmeister",
            "Hufschmied",
            "Sattler",
            "Riemer",
            "Wagner"
        ]
    },    
    {
        'name': "Kriegsschiff",
        'roles': [
            "der Kriegsherr",
            "Krieger",
            "ein Meuterer",
            "Ruderer",
            "ein Seekranker",
            "ein Tunichtgut"
        ]
    },
    {
        'name': "Hafen",
        'roles': [
            "Kaufmann",
            "Händler",
            "Freibeuter",
            "Steuereintreiber",
            "Zöllner",
            "Seefahrer",
            "Reeder",
            "Fischer",
            "Seiler"
        ]
    },    
    {
        'name': "Stadttor",
        'roles': [
            "Zöllner",
            "Händler",
            "die Wache",
            "ein Bettler",
            "ein Reisender",
            "Schausteller"
        ]
    },    
    {
        'name': "Zinsgut",
        'roles': [
            "Bauer",
            "Händler",
            "Magd",
            "der Lehnsherr",
            "der Knecht",
            "der Sohn des Bauern",
            "die Tochter des Bauern"
        ]
    },
    {
        'name': "Schmiede",
        'roles': [
            "der Schmied",
            "der Geselle",
            "ein Knabe",
            "Ritter",
            "Soldat",
            "Söldner",
            "Schwertfeger",
            "Messerschmied",
            "Nagelschmied",
            "Zirkelschmied",
            "Wagner"
        ]
    },    
    {
        'name': "Kaserne",
        'roles': [
            "Soldat",
            "Rekrut",
            "Ausbilder",
            "Rüstmeister",
            "Schwertfeger"
        ]
    },    
    {
        'name': "Marktplatz",
        'roles': [
            "Händler",
            "Schmied",
            "Herold",
            "ein Bettler",
            "ein Taschendieb",
            "ein Hehler",
            "Marktschreier",
            "eine Wache",
            "Metzger",
            "Schneider",
            "Töpfer",
            "Schausteller",
            "Müller"
        ]
    },    
    {
        'name': "Lazarett",
        'roles': [
            "der Medicus",
            "ein Verletzter",
            "Quacksalber",
            "ein Geistlicher",
            "ein Gehilfe"
        ]
    },      
    {
        'name': "Siechenhaus",
        'roles': [
            "ein Kranker",
            "Bader",
            "ein Verletzter",
            "ein Gehilfe",
            "ein Geistlicher",
            "ein Findelkind"
        ]
    },      {
        'name': "Hofküche",
        'roles': [
            "der Küchenmeister",
            "der Wasserholer",
            "der Feuermacher",
            "der Bratspießdreher",
            "Küchenknabe"
        ]
    }
]

const questions = [
    { 'question' : "Zu welcher Tageszeit befindest du dich hier?"},
    { 'question' : "Ist dieser Ort öffentlich oder privat?"},
    { 'question' : "Wie hoch ist die Durchschnittstemperatur?"},
    { 'question' : "Wie hoch ist der Altersdurchschnitt?"},
    { 'question' : "Wie viele Menschen halten sich hier im Druchschnitt auf?"},
    { 'question' : "Bist du privat oder beruflich hier?"},
    { 'question' : "Welche auffälligen Farben gibt es an diesem Ort?"},
    { 'question' : "Kannst du hier Essen und Trinken erwerben?"},
    { 'question' : "Ist der gesellschaftliche Stand gehoben oder eher gering?"},
    { 'question' : "Ist dieser Ort fest oder beweglich?"},
    { 'question' : "Gibt es an diesem Ort einen auffälligen Geruch?"},
    { 'question' : "Wie ist der gesundheitliche Zustand der Menschen an diesem Ort?"},
    { 'question' : "Was für Tiere halten sich hier auf?"},
    { 'question' : "Wie hoch ist der Lautstärkepegel? Ist es eher ruhig oder laut?"},
    { 'question' : "Ist die Stimmung ausgelassen oder ernst?"},
    { 'question' : "Ist es lebensbedrohlich an diesem Ort?"}
]