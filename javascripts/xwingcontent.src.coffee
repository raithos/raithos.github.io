# This must be loaded before any of the card language modules!
exportObj = exports ? this

exportObj.unreleasedExpansions = [
]

exportObj.isReleased = (data) ->
    for source in data.sources
        return true if source not in exportObj.unreleasedExpansions
    false

String::canonicalize = ->
    this.toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .replace(/\s+/g, '-')

# Returns an independent copy of the data which can be modified by translation
# modules.
exportObj.basicCardData = ->
    ships:
        "X-Wing":
            name: "X-Wing"
            xws: "T-65 X-wing".canonicalize()
            factions: [ "Rebel Alliance", ]
            attack: 3
            agility: 2
            hull: 4
            shields: 2
            actions: [
                "Focus"
                "Lock"
                "Barrel Roll"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 2, 2, 2, 0, 0, 0, 0, 0, 0]
              [ 1, 2, 2, 2, 1, 0, 0, 0, 0, 0]
              [ 1, 1, 1, 1, 1, 0, 0, 0, 3, 3]
              [ 0, 0, 1, 0, 0, 3, 0, 0, 0, 0]
            ]
            autoequip: [
              "Servomotor S-Foils"
            ]
        "Y-Wing":
            name: "Y-Wing"
            xws: "BTL-A4 Y-wing".canonicalize()
            factions: [ "Rebel Alliance", "Scum and Villainy" ]
            attack: 2
            agility: 1
            hull: 6
            shields: 2
            actions: [
                "Focus"
                "Lock"
            ]
            actionsred: [
                "Barrel Roll"
                "Reload"
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0]
              [ 0, 2, 2, 2, 0, 0]
              [ 1, 1, 2, 1, 1, 0]
              [ 3, 1, 1, 1, 3, 0]
              [ 0, 0, 3, 0, 0, 3]
            ]
        "A-Wing":
            name: "A-Wing"
            xws: "RZ-1 A-wing".canonicalize()
            factions: [ "Rebel Alliance" ]
            attack: 2
            agility: 3
            hull: 2
            shields: 2
            actions: [
                "Focus"
                "Evade"
                "Lock"
                "Barrel Roll"
                "Boost"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0]
              [ 1, 0, 0, 0, 1, 0, 0, 0]
              [ 2, 2, 2, 2, 2, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 3, 3]
              [ 0, 0, 2, 0, 0, 0, 0, 0]
              [ 0, 0, 2, 0, 0, 3, 0, 0]
            ]
        "YT-1300":
            name: "YT-1300"
            xws: "Modified YT-1300 Light Freighter".canonicalize()
            factions: [ "Rebel Alliance" ]
            attackdt: 3
            agility: 1
            hull: 8
            shields: 5
            actions: [
                "Focus"
                "Lock"
                "Rotate Arc"
            ]
            actionsred: [
                "Boost"
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 1, 2, 1, 0, 0, 0, 0]
              [ 1, 2, 2, 2, 1, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 3, 3]
              [ 0, 0, 1, 0, 0, 3, 0, 0]
            ]
            large: true
        "Customized YT-1300":
            name: "Customized YT-1300"
            canonical_name: 'Customized YT-1300'.canonicalize()
            xws: "Customized YT-1300 Light Freighter".canonicalize()
            factions: [ "Scum and Villainy" ]
            attackdt: 2
            agility: 1
            hull: 8
            shields: 3
            actions: [
                "Focus"
                "Lock"
                "Rotate Arc"
            ]
            actionsred: [
                "Boost"
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 2, 2, 2, 0, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 3, 3]
              [ 0, 0, 1, 0, 0, 3, 0, 0]
            ]
            large: true
        "TIE Fighter":
            name: "TIE Fighter"
            xws: "TIE/ln Fighter".canonicalize()
            factions: ["Rebel Alliance", "Galactic Empire"]
            attack: 2
            agility: 3
            hull: 3
            shields: 0
            actions: [
                "Focus"
                "Barrel Roll"
                "Evade"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0]
              [ 1, 0, 0, 0, 1, 0]
              [ 1, 2, 2, 2, 1, 0]
              [ 1, 1, 2, 1, 1, 3]
              [ 0, 0, 1, 0, 0, 3]
              [ 0, 0, 1, 0, 0, 0]
            ]
        "TIE Advanced":
            name: "TIE Advanced"
            xws: "TIE Advanced x1".canonicalize()
            factions: [ "Galactic Empire" ]
            attack: 2
            agility: 3
            hull: 3
            shields: 2
            actions: [
                "Focus"
                "R> Barrel Roll"
                "Lock"
                "Barrel Roll"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 2, 1, 2, 0, 0, 0, 0, 0, 0]
              [ 1, 2, 2, 2, 1, 0, 0, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 0, 0, 3, 3]
              [ 0, 0, 1, 0, 0, 3, 0, 0, 0, 0]
              [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
            ]
        "TIE Interceptor":
            name: "TIE Interceptor"
            icon: "tieinterceptor"
            xws: "TIE/IN Interceptor".canonicalize()
            factions: [ "Galactic Empire" ]
            attack: 3
            agility: 3
            hull: 3
            shields: 0
            actions: [
                "Focus"
                "Barrel Roll"
                "Boost"
                "Evade"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0]
              [ 1, 0, 0, 0, 1, 0, 0, 0]
              [ 2, 2, 2, 2, 2, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 3, 3]
              [ 0, 0, 2, 0, 0, 3, 0, 0]
              [ 0, 0, 1, 0, 0, 0, 0, 0]
            ]
        "Firespray-31":
            name: "Firespray-31"
            xws: "Firespray-class Patrol Craft".canonicalize()
            factions: [ "Scum and Villainy", ]
            attack: 3
            attackb: 3
            agility: 2
            hull: 6
            shields: 4
            medium: true
            actions: [
                "Focus"
                "Lock"
                "Boost"
            ]
            actionsred: [
                "Reinforce"
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 1, 2, 2, 2, 1, 0, 0, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 0, 0, 0, 0]
              [ 0, 1, 2, 1, 0, 0, 0, 0, 3, 3]
              [ 0, 0, 1, 0, 0, 3, 0, 0, 0, 0]
            ]
        "HWK-290":
            name: "HWK-290"
            xws: "HWK-290 Light Freighter".canonicalize()
            factions: [ "Rebel Alliance", "Scum and Villainy" ]
            attackt: 2
            agility: 2
            hull: 3
            shields: 2
            actions: [
                "Focus"
                "R> Rotate Arc"
                "Lock"
                "R> Rotate Arc"
                "Rotate Arc"
            ]
            actionsred: [
                "Boost"
                "Jam"
            ]
            maneuvers: [
              [ 0, 0, 3, 0, 0]
              [ 0, 2, 2, 2, 0]
              [ 1, 1, 2, 1, 1]
              [ 3, 1, 2, 1, 3]
              [ 0, 0, 1, 0, 0]
            ]
        "Lambda-Class Shuttle":
            name: "Lambda-Class Shuttle"
            xws: "Lambda-class T-4a Shuttle".canonicalize()
            factions: [ "Galactic Empire", ]
            attack: 3
            attackb: 2
            agility: 1
            hull: 6
            shields: 4
            actions: [
                "Focus"
                "Coordinate"
                "Reinforce"
            ]
            actionsred: [
                "Jam"
            ]
            maneuvers: [
              [ 0, 0, 3, 0, 0]
              [ 0, 2, 2, 2, 0]
              [ 3, 1, 2, 1, 3]
              [ 0, 3, 1, 3, 0]
            ]
            large: true
        "B-Wing":
            name: "B-Wing"
            xws: "A/SF-01 B-wing".canonicalize()
            factions: [ "Rebel Alliance", ]
            attack: 3
            agility: 1
            hull: 4
            shields: 4
            actions: [
                "Focus"
                "R> Barrel Roll"
                "Lock"
                "Barrel Roll"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 3, 2, 2, 2, 3, 0, 0, 0, 3, 3]
              [ 1, 1, 2, 1, 1, 3, 0, 0, 0, 0]
              [ 0, 3, 2, 3, 0, 0, 0, 0, 0, 0]
              [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0]
            ]
        "TIE Bomber":
            name: "TIE Bomber"
            xws: "TIE/sa Bomber".canonicalize()
            factions: [ "Galactic Empire", ]
            attack: 2
            agility: 2
            hull: 6
            shields: 0
            actions: [
                "Focus"
                "Lock"
                "Barrel Roll"
                "R> Lock"
            ]
            actionsred: [
                "Reload"
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0]
              [ 0, 1, 2, 1, 0, 0]
              [ 1, 2, 2, 2, 1, 0]
              [ 1, 1, 2, 1, 1, 3]
              [ 0, 0, 1, 0, 0, 0]
              [ 0, 0, 0, 0, 0, 3]
            ]
        "Z-95 Headhunter":
            name: "Z-95 Headhunter"
            xws: "Z-95-AF4 Headhunter".canonicalize()
            factions: [ "Rebel Alliance", "Scum and Villainy", ]
            attack: 2
            agility: 2
            hull: 2
            shields: 2
            actions: [
                "Focus"
                "Lock"
            ]
            actionsred: [
                "Barrel Roll"
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0]
              [ 0, 1, 2, 1, 0, 0]
              [ 1, 2, 2, 2, 1, 0]
              [ 1, 1, 2, 1, 1, 3]
              [ 0, 0, 1, 0, 0, 3]
            ]
        "TIE Defender":
            name: "TIE Defender"
            xws: "TIE/D Defender".canonicalize()
            factions: [ "Galactic Empire", ]
            attack: 3
            agility: 3
            hull: 3
            shields: 4
            actions: [
                "Focus"
                "Evade"
                "Lock"
                "Barrel Roll"
                "Boost"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0]
              [ 3, 2, 0, 2, 3, 0]
              [ 3, 1, 2, 1, 3, 3]
              [ 1, 1, 2, 1, 1, 0]
              [ 0, 0, 2, 0, 0, 1]
              [ 0, 0, 2, 0, 0, 0]
            ]
        "E-Wing":
            name: "E-Wing"
            xws: "E-wing".canonicalize()
            factions: [ "Rebel Alliance", ]
            attack: 3
            agility: 3
            hull: 3
            shields: 3
            actions: [
                "Focus"
                "Evade"
                "Lock"
                "Barrel Roll"
                "R> Lock"
                "Boost"
                "R> Lock"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 3, 2, 2, 2, 3, 0, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0, 3, 3 ]
                [ 0, 0, 2, 0, 0, 3, 0, 0 ]
                [ 0, 0, 1, 0, 0, 0, 0, 0 ]
            ]
        "TIE Phantom":
            name: "TIE Phantom"
            xws: "TIE/ph Phantom".canonicalize()
            factions: [ "Galactic Empire", ]
            attack: 3
            agility: 2
            hull: 3
            shields: 2
            actions: [
                "Focus"
                "Evade"
                "Barrel Roll"
                "Cloak"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0]
                [ 1, 1, 0, 1, 1, 0]
                [ 1, 2, 2, 2, 1, 0]
                [ 1, 1, 2, 1, 1, 3]
                [ 0, 0, 1, 0, 0, 3]
            ]
        "YT-2400":
            name: "YT-2400"
            xws: "YT-2400 Light Freighter".canonicalize()
            factions: [ "Rebel Alliance", ]
            attackdt: 4
            agility: 2
            hull: 6
            shields: 4
            actions: [
                "Focus"
                "Lock"
                "Rotate Arc"
            ]
            actionsred: [
                "Barrel Roll"
            ]
            large: true
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0]
                [ 1, 2, 2, 2, 1, 0]
                [ 1, 1, 2, 1, 1, 0]
                [ 1, 1, 1, 1, 1, 0]
                [ 0, 0, 1, 0, 0, 3]
            ]
        "VT-49 Decimator":
            name: "VT-49 Decimator"
            xws: "VT-49 Decimator".canonicalize()
            factions: [ "Galactic Empire", ]
            attackdt: 3
            agility: 0
            hull: 12
            shields: 4
            actions: [
                "Focus"
                "Lock"
                "Reinforce"
                "Rotate Arc"
            ]
            actionsred: [
                "Coordinate"
            ]
            large: true
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0]
                [ 3, 2, 2, 2, 3, 0]
                [ 1, 1, 2, 1, 1, 0]
                [ 1, 1, 1, 1, 1, 0]
                [ 0, 0, 1, 0, 0, 0]
            ]
        "StarViper":
            name: "StarViper"
            xws: "StarViper-class Attack Platform".canonicalize()
            factions: ["Scum and Villainy"]
            attack: 3
            agility: 3
            hull: 4
            shields: 1
            actions: [
                "Focus"
                "Lock"
                "Barrel Roll"
                "R> Focus"
                "Boost"
                "R> Focus"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0]
                [ 1, 2, 2, 2, 1, 0, 0, 0]
                [ 1, 2, 2, 2, 1, 0, 0, 0]
                [ 0, 1, 2, 1, 0, 0, 3, 3]
                [ 0, 0, 1, 0, 0, 0, 0, 0]
            ]
        "M3-A Interceptor":
            name: "M3-A Interceptor"
            xws: "M3-A Interceptor".canonicalize()
            factions: [ "Scum and Villainy" ]
            attack: 2
            agility: 3
            hull: 3
            shields: 1
            actions: [
                "Focus"
                "Evade"
                "Lock"
                "Barrel Roll"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0 ]
                [ 1, 2, 0, 2, 1, 0 ]
                [ 1, 1, 2, 1, 1, 0 ]
                [ 0, 1, 2, 1, 0, 3 ]
                [ 0, 0, 1, 0, 0, 0 ]
                [ 0, 0, 1, 0, 0, 3 ]
            ]
        "Aggressor":
            name: "Aggressor"
            xws: "Aggressor Assault Fighter".canonicalize()
            factions: [ "Scum and Villainy" ]
            attack: 3
            agility: 3
            hull: 5
            shields: 3
            actions: [
                "Calculate"
                "Evade"
                "Lock"
                "Boost"
            ]
            actionsred: [
            ]
            medium: true
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 1, 2, 2, 2, 1, 0, 0, 0 ]
                [ 1, 2, 2, 2, 1, 0, 0, 0 ]
                [ 0, 2, 2, 2, 0, 0, 3, 3 ]
                [ 0, 0, 1, 0, 0, 3, 0, 0 ]
            ]
        "YV-666":
            name: "YV-666"
            xws: "YV-666 Light Freighter".canonicalize()
            factions: [ "Scum and Villainy" ]
            attackf: 3
            agility: 1
            hull: 9
            shields: 3
            large: true
            actions: [
                "Focus"
                "Reinforce"
                "Lock"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 3, 0, 0, 0 ]
                [ 0, 2, 2, 2, 0, 0 ]
                [ 3, 1, 2, 1, 3, 0 ]
                [ 1, 1, 2, 1, 1, 0 ]
                [ 0, 0, 1, 0, 0, 0 ]
            ]
        "Kihraxz Fighter":
            name: "Kihraxz Fighter"
            xws: "Kihraxz Fighter".canonicalize()
            factions: ["Scum and Villainy"]
            attack: 3
            agility: 2
            hull: 5
            shields: 1
            actions: [
                "Focus"
                "Lock"
                "Barrel Roll"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 1, 2, 0, 2, 1, 0, 0, 0, 0, 0 ]
                [ 1, 2, 2, 2, 1, 0, 0, 0, 3, 3 ]
                [ 0, 1, 2, 1, 0, 0, 0, 0, 0, 0 ]
                [ 0, 0, 1, 0, 0, 3, 0, 0, 0, 0 ]
            ]
        "K-Wing":
            name: "K-Wing"
            xws: "BTL-S8 K-wing".canonicalize()
            factions: ["Rebel Alliance"]
            attackdt: 2
            agility: 1
            hull: 6
            shields: 3
            medium: true
            actions: [
                "Focus"
                "Lock"
                "Slam"
                "Rotate Arc"
                "Reload"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0 ]
                [ 0, 2, 2, 2, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0 ]
                [ 0, 1, 1, 1, 0, 0 ]
            ]
        "TIE Punisher":
            name: "TIE Punisher"
            xws: "TIE/ca Punisher".canonicalize()
            factions: ["Galactic Empire"]
            attack: 2
            agility: 1
            hull: 6
            shields: 3
            medium: true
            actions: [
                "Focus"
                "Lock"
                "Boost"
                "R> Lock"
                "Reload"
            ]
            actionsred: [
                "Barrel Roll"
            ]
            maneuvers: [
                [ 0, 0, 3, 0, 0, 0 ]
                [ 0, 2, 2, 2, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0 ]
                [ 3, 1, 1, 1, 3, 0 ]
                [ 0, 0, 0, 0, 0, 3 ]
            ]
        "VCX-100":
            name: "VCX-100"
            xws: "VCX-100 Light Freighter".canonicalize()
            factions: ["Rebel Alliance"]
            attack: 4
            agility: 0
            hull: 10
            shields: 4
            large: true
            actions: [
                "Focus"
                "Lock"
                "Reinforce"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0 ]
                [ 3, 1, 2, 1, 3, 0 ]
                [ 1, 2, 2, 2, 1, 0 ]
                [ 3, 1, 1, 1, 3, 0 ]
                [ 0, 0, 1, 0, 0, 3 ]
            ]
        "Attack Shuttle":
            name: "Attack Shuttle"
            xws: "Attack Shuttle".canonicalize()
            factions: ["Rebel Alliance"]
            attack: 3
            agility: 2
            hull: 3
            shields: 1
            actions: [
                "Focus"
                "Evade"
                "Barrel Roll"
                "R> Evade"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0 ]
                [ 3, 2, 2, 2, 3, 0 ]
                [ 1, 1, 2, 1, 1, 0 ]
                [ 3, 1, 1, 1, 3, 0 ]
                [ 0, 0, 1, 0, 0, 3 ]
            ]
        "TIE Advanced Prototype":
            name: "TIE Advanced Prototype"
            xws: "TIE Advanced v1".canonicalize()
            factions: ["Galactic Empire"]
            attack: 2
            agility: 3
            hull: 2
            shields: 2
            actions: [
                "Focus"
                "Evade"
                "Lock"
                "Barrel Roll"
                "R> Focus"
                "Boost"
                "R> Focus"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 2, 2, 0, 2, 2, 0, 0, 0, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0, 0, 0, 3, 3 ]
                [ 1, 1, 2, 1, 1, 0, 0, 0, 0, 0 ]
                [ 0, 0, 1, 0, 0, 3, 0, 0, 0, 0 ]
                [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0 ]
            ]
        "G-1A Starfighter":
            name: "G-1A Starfighter"
            xws: "G-1A Starfighter".canonicalize()
            factions: ["Scum and Villainy"]
            attack: 3
            agility: 1
            hull: 5
            shields: 4
            medium: true
            actions: [
                "Focus"
                "Lock"
                "Jam"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 3, 0, 0, 0 ]
                [ 3, 2, 2, 2, 3, 0 ]
                [ 1, 1, 2, 1, 1, 3 ]
                [ 0, 3, 1, 3, 0, 0 ]
                [ 0, 0, 3, 0, 0, 3 ]
            ]
        "JumpMaster 5000":
            name: "JumpMaster 5000"
            xws: "JumpMaster 5000".canonicalize()
            factions: ["Scum and Villainy"]
            large: true
            attackt: 2
            agility: 2
            hull: 6
            shields: 3
            actions: [
                "Focus"
                "R> Rotate Arc"
                "Lock"
                "R> Rotate Arc"
            ]
            actionsred: [
                "Barrel Roll"
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 1, 2, 2, 1, 3, 0, 0, 0 ]
                [ 1, 2, 2, 1, 3, 0, 0, 0 ]
                [ 0, 2, 2, 1, 0, 0, 3, 0 ]
                [ 0, 0, 1, 0, 0, 3, 0, 0 ]
            ]
        "ARC-170":
            name: "ARC-170"
            xws: "ARC-170 Starfighter".canonicalize()
            factions: ["Rebel Alliance","Galactic Republic"]
            attack: 3
            attackb: 2
            agility: 1
            hull: 6
            shields: 3
            medium: true
            actions: [
                "Focus"
                "Lock"
            ]
            actionsred: [
                "Barrel Roll"
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0 ]
                [ 0, 2, 2, 2, 0, 0 ]
                [ 1, 2, 2, 2, 1, 0 ]
                [ 3, 1, 1, 1, 3, 0 ]
                [ 0, 0, 3, 0, 0, 3 ]
            ]
        "Fang Fighter":
            name: "Fang Fighter"
            canonical_name: 'Protectorate Starfighter'.canonicalize()
            xws: "Fang Fighter".canonicalize()
            factions: ["Scum and Villainy"]
            attack: 3
            agility: 3
            hull: 4
            shields: 0
            actions: [
                "Focus"
                "Lock"
                "Barrel Roll"
                "R> Focus"
                "Boost"
                "R> Focus"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 1, 0, 0, 0, 1, 0, 0, 0, 0, 0 ]
                [ 2, 2, 2, 2, 2, 0, 0, 0, 3, 3 ]
                [ 1, 1, 2, 1, 1, 0, 0, 0, 0, 0 ]
                [ 0, 0, 1, 0, 0, 3, 0, 0, 0, 0 ]
                [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0 ]
            ]
        "Lancer-Class Pursuit Craft":
            name: "Lancer-Class Pursuit Craft"
            xws: "Lancer-class Pursuit Craft".canonicalize()
            factions: ["Scum and Villainy"]
            large: true
            attack: 3
            attackt: 2
            agility: 2
            hull: 8
            shields: 2
            actions: [
                "Focus"
                "Evade"
                "Lock"
                "Rotate Arc"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0]
                [ 0, 1, 1, 1, 0, 0]
                [ 1, 1, 2, 1, 1, 0]
                [ 2, 2, 2, 2, 2, 0]
                [ 0, 0, 2, 0, 0, 0]
                [ 0, 0, 1, 0, 0, 3]
            ]
        "Quadjumper":
            name: "Quadjumper"
            xws: "Quadrijet Transfer Spacetug".canonicalize()
            factions: ["Scum and Villainy"]
            attack: 2
            agility: 2
            hull: 5
            shields: 0
            actions: [
                "Barrel Roll"
                "Focus"
            ]
            actionsred: [
                "Evade"
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 3, 0, 3 ]
                [ 1, 2, 2, 2, 1, 0, 3, 3, 0, 0, 0, 3, 0 ]
                [ 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
            ]
        "U-Wing":
            name: "U-Wing"
            xws: "UT-60D U-wing".canonicalize()
            factions: ["Rebel Alliance"]
            medium: true
            attack: 3
            agility: 2
            hull: 5
            shields: 3
            actions: [
                "Focus"
                "Lock"
            ]
            actionsred: [
                "Coordinate"
            ]
            maneuvers: [
                [ 0, 0, 3, 0, 0 ]
                [ 0, 2, 2, 2, 0 ]
                [ 1, 2, 2, 2, 1 ]
                [ 0, 1, 1, 1, 0 ]
                [ 0, 0, 1, 0, 0 ]
            ]
            autoequip: [
              "Pivot Wing"
            ]
        "TIE Striker":
            name: "TIE Striker"
            xws: "TIE/sk Striker".canonicalize()
            factions: ["Galactic Empire"]
            attack: 3
            agility: 2
            hull: 4
            shields: 0
            actions: [
                "Focus"
                "Evade"
                "Barrel Roll"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 1, 2, 2, 2, 1, 3, 0, 0 ]
                [ 1, 2, 2, 2, 1, 0, 3, 3 ]
                [ 0, 1, 2, 1, 0, 0, 0, 0 ]
            ]
        "Auzituck Gunship":
            name: "Auzituck Gunship"
            xws: "Auzituck Gunship".canonicalize()
            factions: ["Rebel Alliance"]
            attackf: 3
            agility: 1
            hull: 6
            shields: 2
            actions: [
                "Focus"
                "Reinforce"
            ]
            actionsred: [
                "Barrel Roll"
            ]
            maneuvers: [
                [ 0, 0, 3, 0, 0, 0, 0, 0 ]
                [ 0, 2, 2, 2, 0, 0, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0, 0, 0 ]
                [ 0, 0, 1, 0, 0, 0, 0, 0 ]
            ]
        "Scurrg H-6 Bomber":
            name: "Scurrg H-6 Bomber"
            xws: "Scurrg H-6 Bomber".canonicalize()
            factions: ["Scum and Villainy"]
            attack: 3
            agility: 1
            hull: 6
            shields: 4
            medium: true
            actions: [
                "Focus"
                "Lock"
            ]
            actionsred: [
                "Barrel Roll"
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 0, 2, 2, 2, 0, 0, 0, 0, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0, 0, 0, 0, 0 ]
                [ 3, 1, 1, 1, 3, 0, 0, 0, 3, 3 ]
                [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0 ]
            ]
        "TIE Aggressor":
            name: "TIE Aggressor"
            xws: "TIE/ag Aggressor".canonicalize()
            factions: ["Galactic Empire"]
            attack: 2
            agility: 2
            hull: 4
            shields: 1
            actions: [
                "Focus"
                "Lock"
                "Barrel Roll"
                "R> Evade"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 0, 1, 2, 1, 0, 0, 0, 0, 0, 0 ]
                [ 1, 2, 2, 2, 1, 0, 0, 0, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0, 0, 0, 0, 0 ]
                [ 0, 0, 1, 0, 0, 3, 0, 0, 0, 0 ]
            ]
        "Alpha-Class Star Wing":
            name: "Alpha-Class Star Wing"
            xws: "Alpha-class Star Wing".canonicalize()
            factions: ["Galactic Empire"]
            attack: 2
            agility: 2
            hull: 4
            shields: 3
            actions: [
                "Focus"
                "Lock"
                "Slam"
                "Reload"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 0, 1, 2, 1, 0, 0, 0, 0 ]
                [ 1, 2, 2, 2, 1, 0, 0, 0 ]
                [ 1, 1, 1, 1, 1, 0, 0, 0 ]
                [ 0, 0, 3, 0, 0, 0, 0, 0 ]
            ]
        "M12-L Kimogila Fighter":
            name: "M12-L Kimogila Fighter"
            xws: "M12-L Kimogila Fighter".canonicalize()
            factions: ["Scum and Villainy"]
            attack: 3
            agility: 1
            hull: 7
            shields: 2
            medium: true
            actions: [
                "Focus"
                "Lock"
                "Reload"
            ]
            actionsred: [
                "Barrel Roll"
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0]
                [ 3, 1, 2, 1, 3, 0]
                [ 1, 2, 2, 2, 1, 0]
                [ 1, 1, 2, 1, 1, 0]
                [ 0, 0, 0, 0, 0, 3]
            ]
        "Sheathipede-Class Shuttle":
            name: "Sheathipede-Class Shuttle"
            xws: "Sheathipede-class Shuttle".canonicalize()
            factions: ["Rebel Alliance"]
            attack: 2
            attackb: 2
            agility: 2
            hull: 4
            shields: 1
            actions: [
                "Focus"
                "Coordinate"
            ]
            actionsred: [
            ]
            maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                [ 0, 1, 2, 1, 0, 0, 0, 0, 0, 0, 0, 3, 0]
                [ 1, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0]
                [ 3, 1, 2, 1, 3, 3, 0, 0, 0, 0, 0, 0, 0]
                [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        "TIE Reaper":
            name: "TIE Reaper"
            xws: "TIE Reaper".canonicalize()
            factions: ["Galactic Empire"]
            attack: 3
            agility: 1
            hull: 6
            shields: 2
            medium: true
            actions: [
                "Focus"
                "Evade"
                "Jam"
            ]
            actionsred: [
                "Coordinate"
            ]
            maneuvers: [
                [ 0, 0, 3, 0, 0, 0, 0, 0 ]
                [ 3, 2, 2, 2, 3, 0, 3, 3 ]
                [ 3, 1, 2, 1, 3, 0, 0, 0 ]
                [ 0, 1, 2, 1, 0, 0, 0, 0 ]
            ]
        "Escape Craft":
            name: "Escape Craft"
            xws: "Escape Craft".canonicalize()
            factions: ["Scum and Villainy"]
            attack: 2
            agility: 2
            hull: 2
            shields: 2
            actions: [
                "Focus"
                "Barrel Roll"
            ]
            actionsred: [
                "Coordinate"
            ]
            maneuvers: [
                [ 0, 0, 3, 0, 0, 0, 0, 0 ]
                [ 0, 2, 2, 2, 0, 0, 0, 0 ]
                [ 3, 1, 2, 1, 3, 0, 0, 0 ]
                [ 0, 1, 1, 1, 0, 3, 0, 0 ]
            ]
        "T-70 X-Wing":
            name: "T-70 X-Wing"
            xws: "T-70 X-wing".canonicalize()
            factions: [ "Resistance"]
            attack: 3
            agility: 2
            hull: 4
            shields: 3
            actions: [
                "Focus"
                "Lock"
                "Boost"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 2, 2, 2, 0, 0, 0, 0, 0, 0]
              [ 1, 2, 2, 2, 1, 0, 0, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 0, 0, 3, 3]
              [ 0, 0, 1, 0, 0, 3, 0, 0, 0, 0]
            ]
            autoequip: [
              "Integrated S-Foils"
            ]
        "RZ-2 A-Wing":
            name: "RZ-2 A-Wing"
            xws: "RZ-2 A-wing".canonicalize()
            factions: ["Resistance"]
            attackt: 2
            agility: 3
            hull: 2
            shields: 2
            actions: [
                "Focus"
                "Evade"
                "Lock"
                "Barrel Roll"
                "Boost"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0]
              [ 1, 0, 0, 0, 1, 0, 0, 0]
              [ 2, 2, 2, 2, 2, 0, 0, 0]
              [ 1, 2, 2, 2, 1, 0, 3, 3]
              [ 0, 0, 2, 0, 0, 0, 0, 0]
              [ 0, 0, 2, 0, 0, 3, 0, 0]
            ]
        "TIE/FO Fighter":
            name: "TIE/FO Fighter"
            xws: "TIE/fo Fighter".canonicalize()
            factions: ["First Order"]
            attack: 2
            agility: 3
            hull: 3
            shields: 1
            actions: [
                "Focus"
                "Evade"
                "Lock"
                "Barrel Roll"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0]
              [ 1, 0, 0, 0, 1, 0, 0, 0]
              [ 2, 2, 2, 2, 2, 0, 3, 3]
              [ 1, 1, 2, 1, 1, 0, 0, 0]
              [ 0, 0, 1, 0, 0, 3, 0, 0]
              [ 0, 0, 1, 0, 0, 0, 0, 0]
            ]
        "TIE/VN Silencer":
            name: "TIE/VN Silencer"
            xws: "TIE/vn Silencer".canonicalize()
            factions: ["First Order"]
            attack: 3
            agility: 3
            hull: 4
            shields: 2
            actions: [
                "Focus"
                "Boost"
                "Lock"
                "Barrel Roll"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 1, 0, 0, 0, 1, 0, 0, 0, 0, 0]
              [ 2, 2, 2, 2, 2, 0, 0, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 0, 0, 3, 3]
              [ 0, 0, 2, 0, 0, 3, 0, 0, 0, 0]
              [ 0, 0, 2, 0, 0, 0, 0, 0, 0, 0]
            ]
        "TIE/SF Fighter":
            name: "TIE/SF Fighter"
            xws: "TIE/sf Fighter".canonicalize()
            factions: ["First Order"]
            attack: 2
            attackt: 2
            agility: 2
            hull: 3
            shields: 3
            actions: [
                "Focus"
                "> Rotate Arc"
                "Evade"
                "> Rotate Arc"
                "Lock"
                "> Rotate Arc"
                "Barrel Roll"
                "> Rotate Arc"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 3, 2, 2, 2, 3, 0, 0, 0, 0, 0]
              [ 1, 2, 2, 2, 1, 0, 0, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 3, 3, 0, 0]
              [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
            ]
        "Upsilon-Class Command Shuttle":
            name: "Upsilon-Class Command Shuttle"
            xws: "Upsilon-class command shuttle".canonicalize()
            factions: ["First Order"]
            attack: 4
            agility: 1
            hull: 6
            shields: 6
            actions: [
                "Focus"
                "Lock"
                "Reinforce"
                "Coordinate"
                "Jam"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0]
              [ 3, 1, 2, 1, 3, 0, 0, 0, 0, 0]
              [ 1, 2, 2, 2, 1, 0, 0, 0, 0, 0]
              [ 3, 1, 1, 1, 3, 0, 0, 0, 0, 0]
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
            large: true
        "MG-100 StarFortress":
            name: "MG-100 StarFortress"
            xws: "MG-100 StarFortress".canonicalize()
            factions: ["Resistance"]
            attack: 3
            attackdt: 2
            agility: 1
            hull: 9
            shields: 3
            actions: [
                "Focus"
                "Lock"
                "Rotate Arc"
                "Reload"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0]
              [ 3, 2, 2, 2, 3, 0, 0, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 0, 0, 0, 0]
              [ 0, 3, 1, 3, 0, 0, 0, 0, 0, 0]
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
            large: true
        "Scavenged YT-1300":
            name: "Scavenged YT-1300"
            canonical_name: 'Scavenged YT-1300'.canonicalize()
            xws: "Scavenged YT-1300".canonicalize()
            factions: [ "Resistance" ]
            attackdt: 3
            agility: 1
            hull: 8
            shields: 3
            actions: [
                "Focus"
                "Lock"
            ]
            actionsred: [
                "Boost"
                "Rotate Arc"
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 1, 2, 1, 0, 0, 0, 0]
              [ 1, 2, 2, 2, 1, 0, 0, 0]
              [ 1, 1, 1, 1, 1, 0, 3, 3]
              [ 0, 0, 3, 0, 0, 0, 0, 0]
            ]
            large: true
        "Mining Guild TIE Fighter":
            name: "Mining Guild TIE Fighter"
            xws: "Modified TIE/ln Fighter".canonicalize()
            factions: ["Scum and Villainy"]
            attack: 2
            agility: 3
            hull: 3
            shields: 0
            actions: [
                "Focus"
                "Barrel Roll"
                "Evade"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0]
              [ 1, 0, 0, 0, 1, 0]
              [ 1, 2, 2, 2, 1, 0]
              [ 1, 1, 2, 1, 1, 3]
              [ 0, 0, 1, 0, 0, 0]
              [ 0, 0, 3, 0, 0, 0]
            ]
        "V-19 Torrent":
            name: "V-19 Torrent"
            xws: "V-19 Torrent Starfighter".canonicalize()
            factions: ["Galactic Republic"]
            attack: 2
            agility: 2
            hull: 5
            shields: 0
            actions: [
                "Focus"
                "Evade"
                "Lock"
                "Barrel Roll"
                "R> Evade"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 3, 2, 2, 2, 3, 0, 0, 0, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 0, 0, 3, 3]
              [ 0, 3, 2, 3, 0, 3, 0, 0, 0, 0]
              [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            ]
        "Delta-7 Aethersprite":
            name: "Delta-7 Aethersprite"
            xws: "Delta-7 Aethersprite".canonicalize()
            factions: ["Galactic Republic"]
            attack: 2
            agility: 3
            hull: 3
            shields: 1
            actions: [
                "Focus"
                "F-Evade"
                "Lock"
                "Barrel Roll"
                "Boost"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 1, 2, 0, 2, 1, 0, 0, 0, 0, 0]
              [ 1, 2, 2, 2, 1, 0, 3, 3, 0, 0]
              [ 0, 1, 2, 1, 0, 0, 0, 0, 0, 0]
              [ 0, 0, 1, 0, 0, 3, 0, 0, 0, 0]
              [ 0, 0, 1, 0, 0, 3, 0, 0, 0, 0]
            ]
        "Sith Infiltrator":
            name: "Sith Infiltrator"
            xws: "Sith Infiltrator".canonicalize()
            factions: ["Separatist Alliance"]
            attack: 3
            agility: 1
            hull: 6
            large: true
            shields: 4
            actions: [
                "Focus"
                "Lock"
            ]
            actionsred: [
                "Barrel Roll"
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 3, 2, 2, 2, 3, 0, 0, 0, 0, 0]
              [ 1, 2, 2, 2, 1, 0, 3, 3, 0, 0]
              [ 1, 1, 2, 1, 1, 0, 0, 0, 0, 0]
              [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 0, 0, 0, 0, 3, 0, 0, 0, 0]
            ]
        "Vulture-class Droid Fighter":
            name: "Vulture-class Droid Fighter"
            xws: "Vulture-class Droid Fighter".canonicalize()
            factions: ["Separatist Alliance"]
            attack: 2
            agility: 2
            hull: 3
            shields: 0
            actions: [
                "Calculate"
                "Lock"
                "Barrel Roll"
                "R> Calculate"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 1, 0, 0, 0, 1, 3, 0, 0, 0, 0]
              [ 2, 1, 2, 1, 2, 0, 0, 0, 3, 3]
              [ 1, 3, 2, 3, 1, 0, 0, 0, 0, 0]
              [ 0, 0, 2, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
            ]
        "Belbullab-22 Starfighter":
            name: "Belbullab-22 Starfighter"
            xws: "Belbullab-22 Starfighter".canonicalize()
            factions: ["Separatist Alliance"]
            attack: 3
            agility: 2
            hull: 3
            shields: 2
            actions: [
                "Focus"
                "Lock"
                "Barrel Roll"
                "R> Focus"
                "Boost"
                "R> Focus"
            ]
            actionsred: [
            ]
            maneuvers: [
              [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
              [ 1, 1, 0, 1, 1, 0, 0, 0, 0, 0]
              [ 1, 2, 2, 2, 1, 0, 0, 0, 0, 0]
              [ 3, 1, 2, 1, 3, 0, 3, 3, 0, 0]
              [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
              [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
            ]
        "Naboo Royal N-1 Starfighter":
           name: "Naboo Royal N-1 Starfighter"
           xws: "Naboo Royal N-1 Starfighter".canonicalize()
           factions: ["Galactic Republic"]
           attack: 2
           agility: 2
           hull: 3
           shields: 2
           actions: [
             "Focus"
             "Lock"
             "Barrel Roll"
             "Boost"
           ]
           actionsred: [
           ]
           maneuvers: [
             [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
             [ 0, 1, 1, 1, 0, 0, 0, 0, 0, 0]
             [ 1, 2, 2, 2, 1, 0, 0, 0, 0, 0]
             [ 1, 2, 2, 2, 1, 0, 0, 0, 3, 3]
             [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
             [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
           ]
        "Hyena-Class Droid Bomber":
           name: "Hyena-Class Droid Bomber"
           xws: "Hyena-Class Droid Bomber".canonicalize()
           factions: ["Separatist Alliance"]
           attack: 2
           agility: 2
           hull: 5
           shields: 0
           actions: [
             "Calculate"
             "Lock"
             "Barrel Roll"
             "R> Lock"
           ]
           actionsred: [
             "Reload"
           ]
           maneuvers: [
             [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
             [ 1, 3, 1, 3, 1, 0, 0, 0, 0, 0]
             [ 2, 1, 2, 1, 2, 3, 0, 0, 3, 3]
             [ 1, 0, 2, 0, 1, 0, 0, 0, 0, 0]
             [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0]
             [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0]
           ]
        "Resistance Transport Pod":
           name: "Resistance Transport Pod"
           xws: "Resistance Transport Pod".canonicalize()
           factions: ["Resistance"]
           attack: 2
           agility: 2
           hull: 3
           shields: 1
           actions: [
             "Focus"
           ]
           actionsred: [
             "Lock"
             "Barrel Roll"
             "Jam"
           ]
           maneuvers: [
             [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
             [ 3, 2, 2, 2, 3, 0, 0, 0, 0, 0]
             [ 1, 1, 2, 1, 1, 0, 0, 0, 0, 0]
             [ 0, 3, 1, 3, 0, 3, 0, 0, 0, 0]
             [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0]
           ]
        "Resistance Transport":
           name: "Resistance Transport"
           xws: "Resistance Transport".canonicalize()
           factions: ["Resistance"]
           attack: 2
           agility: 1
           hull: 5
           shields: 3
           actions: [
             "Focus"
             "Lock"
           ]
           actionsred: [
             "Coordinate"
             "Jam"
           ]
           maneuvers: [
                [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 3, 2, 2, 2, 3, 0, 0, 0, 0, 0, 3, 0, 3 ]
                [ 1, 1, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 0, 3, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
           ]
        "Nantex-Class Starfighter":
           name: "Nantex-Class Starfighter"
           xws: "Nantex-Class Starfighter".canonicalize()
           factions: ["Separatist Alliance"]
           attackbull: 3
           attackt: 2
           agility: 3
           hull: 4
           shields: 0
           actions: [
             "Focus"
             "Evade"
           ]
           maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0]
                [ 1, 2, 0, 2, 1, 0, 0, 0]
                [ 1, 2, 2, 2, 1, 0, 0, 0]
                [ 1, 2, 2, 2, 1, 0, 3, 3]
                [ 0, 0, 1, 0, 0, 0, 0, 0]
                [ 0, 0, 1, 0, 0, 3, 0, 0]
           ]
        "BTL-B Y-Wing":
           name: "BTL-B Y-Wing"
           xws: "BTL-B Y-Wing".canonicalize()
           factions: ["Galactic Republic"]
           attack: 2
           agility: 1
           hull: 5
           shields: 3
           actions: [
             "Focus"
             "Lock"
           ]
           actionsred: [
             "Barrel Roll"
             "Reload"
           ]
           maneuvers: [
                [ 0, 0, 0, 0, 0, 0]
                [ 0, 1, 2, 1, 0, 0]
                [ 1, 1, 2, 1, 1, 0]
                [ 3, 1, 1, 1, 3, 0]
                [ 0, 0, 3, 0, 0, 3]
                [ 0, 0, 0, 0, 0, 0]
           ]
        "Fireball":
           name: "Fireball"
           xws: "Fireball".canonicalize()
           factions: ["Resistance"]
           attack: 2
           agility: 2
           hull: 6
           shields: 0
           actions: [
             "Focus"
             "Evade"
             "Barrel Roll"
             "Slam"
           ]
           actionsred: [
           ]
           maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 1, 2, 2, 2, 1, 0, 0, 0, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0, 0, 0, 0, 0 ]
                [ 3, 1, 1, 1, 3, 0, 0, 0, 3, 3 ]
                [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0 ]
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
           ]
        "TIE/Ba Interceptor":
           name: "TIE/Ba Interceptor"
           xws: "TIE/Ba Interceptor".canonicalize()
           factions: ["First Order"]
           attack: 3
           agility: 3
           hull: 2
           shields: 2
           actions: [
             "Focus"
             "Evade"
             "Lock"
             "Barrel Roll"
             "Boost"
           ]
           maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 2, 2, 0, 2, 2, 0, 0, 0, 0, 0 ]
                [ 1, 2, 2, 2, 1, 0, 3, 3, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0, 0, 0, 0, 0 ]
                [ 0, 0, 2, 0, 0, 0, 0, 0, 0, 0 ]
                [ 0, 0, 1, 0, 0, 3, 0, 0, 0, 0 ]
           ]
        "Xi-class Light Shuttle":
           name: "Xi-class Light Shuttle"
           xws: "Xi-class Light Shuttle".canonicalize()
           factions: ["First Order"]
           attack: 2
           agility: 2
           hull: 5
           shields: 2
           actions: [
             "Focus"
             "Jam"
           ]
           actionsred: [
             "Lock"
             "Coordinate"
           ]
           maneuvers: [
                [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0 ]
                [ 0, 2, 2, 2, 0, 0, 0, 0, 0, 0 ]
                [ 1, 2, 2, 2, 1, 0, 0, 0, 0, 0 ]
                [ 3, 1, 1, 1, 3, 0, 0, 0, 0, 0 ]
                [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0 ]
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
           ]
        "HMP Droid Gunship":
           name: "HMP Droid Gunship"
           xws: "HMP Droid Gunship".canonicalize()
           factions: ["Separatist Alliance"]
           attackf: 2
           agility: 1
           hull: 5
           shields: 3
           actions: [
             "Calculate"
             "Lock"
             "Reload"
             "R> Calculate"
           ]
           actionsred: [
             "Roll"
           ]
           maneuvers: [
                [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0 ]
                [ 0, 3, 2, 3, 0, 0, 0, 0, 0, 0 ]
                [ 2, 1, 2, 1, 2, 0, 0, 0, 0, 0 ]
                [ 1, 3, 1, 3, 1, 0, 0, 0, 0, 0 ]
                [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0 ]
                [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0 ]
           ]
        "LAAT/i Gunship":
           name: "LAAT/i Gunship"
           xws: "LAAT/i Gunship".canonicalize()
           factions: ["Galactic Republic"]
           attackt: 2
           agility: 1
           hull: 8
           shields: 2
           actions: [
             "Focus"
             "Lock"
             "Rotate"
             "Reload"
           ]
           actionsred: [
             "Reinforce"
           ]
           maneuvers: [
                [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0 ]
                [ 0, 1, 2, 1, 0, 0, 0, 0, 0, 0 ]
                [ 1, 1, 2, 1, 1, 0, 0, 0, 0, 0 ]
                [ 3, 1, 1, 1, 3, 0, 0, 0, 0, 0 ]
                [ 0, 0, 3, 0, 0, 0, 0, 0, 0, 0 ]
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
           ]
        "TIE/rb Heavy":
           name: "TIE/rb Heavy"
           xws: "TIE/rb Heavy".canonicalize()
           factions: ["Galactic Empire"]
           attackt: 2
           agility: 1
           hull: 8
           actions: [
             "Focus"
             "Reinforce"
             "Lock"
             "Rotate"
             "R> Calculate"
           ]
           actionsred: [
             "Barrel Roll"
           ]
           maneuvers: [
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
                [ 3, 1, 2, 1, 3, 0, 0, 0, 0, 0 ]
                [ 1, 2, 2, 2, 1, 0, 0, 0, 0, 0 ]
                [ 3, 1, 3, 1, 3, 3, 0, 0, 3, 3 ]
                [ 0, 0, 1, 0, 0, 0, 0, 0, 0, 0 ]
                [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
           ]

        # Epic Section
        "CR90 Corellian Corvette":
           name: "CR90 Corellian Corvette"
           xws: "CR90 Corellian Corvette".canonicalize()
           icon: "cr90corvette"
           factions: ["Galactic Republic", "Rebel Alliance"]
           huge: true
           attackl: 4
           attackr: 4
           agility: 0
           hull: 18
           shields: 7
           shieldrecurr: 2
           energy: 7
           energyrecurr: 2
           actions: [
             "Focus"
             "Reinforce"
             "Lock"
             "Jam"
           ]
           actionsred: [
             "Coordinate"
           ]
           maneuvers: [
                [ 0, 3, 3, 3, 0]
                [ 0, 1, 1, 1, 0]
                [ 0, 2, 2, 2, 0]
                [ 0, 3, 2, 3, 0]
                [ 0, 0, 3, 0, 0]
                [ 0, 0, 3, 0, 0]
           ]
        "Raider-class Corvette":
           name: "Raider-class Corvette"
           xws: "Raider-class Corvette".canonicalize()
           factions: ["Galactic Empire", "First Order"]
           huge: true
           attackf: 4
           agility: 0
           hull: 20
           shields: 8
           shieldrecurr: 2
           energy: 6
           energyrecurr: 2
           actions: [
             "Focus"
             "Reinforce"
             "Lock"
             "Coordinate"
             "Jam"
           ]
           maneuvers: [
                [ 0, 3, 3, 3, 0]
                [ 0, 2, 1, 2, 0]
                [ 0, 1, 2, 1, 0]
                [ 0, 3, 2, 3, 0]
                [ 0, 0, 1, 0, 0]
                [ 0, 0, 3, 0, 0]
           ]
        "GR-75 Medium Transport":
           name: "GR-75 Medium Transport"
           xws: "GR-75 Medium Transport".canonicalize()
           factions: ["Rebel Alliance", "Resistance"]
           huge: true
           attack: 2
           agility: 0
           hull: 12
           shields: 3
           shieldrecurr: 1
           energy: 4
           energyrecurr: 1
           actions: [
             "Focus"
             "Coordinate"
             "Jam"
           ]
           actionsred: [
             "Reinforce"
             "Lock"
           ]
           maneuvers: [
                [ 0, 3, 3, 3, 0]
                [ 0, 2, 2, 2, 0]
                [ 0, 1, 1, 1, 0]
                [ 0, 0, 3, 0, 0]
                [ 0, 0, 3, 0, 0]
           ]
        "Gozanti-class Cruiser":
           name: "Gozanti-class Cruiser"
           xws: "Gozanti-class Cruiser".canonicalize()
           factions: ["Galactic Empire", "First Order"]
           huge: true
           attack: 3
           agility: 0
           hull: 11
           shields: 5
           shieldrecurr: 1
           energy: 3
           energyrecurr: 1
           actions: [
             "Focus"
             "Reinforce"
             "Lock"
             "Coordinate"
             "Jam"
           ]
           maneuvers: [
                [ 0, 3, 3, 3, 0]
                [ 0, 1, 2, 1, 0]
                [ 0, 3, 2, 3, 0]
                [ 0, 0, 2, 0, 0]
                [ 0, 0, 3, 0, 0]
           ]
        "C-ROC Cruiser":
           name: "C-ROC Cruiser"
           xws: "C-ROC Cruiser".canonicalize()
           factions: ["Separatist Alliance", "Scum and Villainy"]
           huge: true
           attack: 3
           agility: 0
           hull: 12
           shields: 4
           shieldrecurr: 1
           energy: 4
           energyrecurr: 1
           actions: [
             "Focus"
             "Reinforce"
             "Lock"
             "Jam"
           ]
           actionsred: [
             "Coordinate"
           ]
           maneuvers: [
                [ 0, 3, 3, 3, 0]
                [ 0, 1, 2, 1, 0]
                [ 0, 1, 2, 1, 0]
                [ 0, 3, 1, 3, 0]
                [ 0, 0, 3, 0, 0]
                [ 0, 0, 3, 0, 0]
           ]

    # name field is for convenience only
    pilotsById: [
        {
            name: "Cavern Angels Zealot"
            id: 0
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 1
            points: 39
            slots: [
                "Illicit"
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Blue Squadron Escort"
            id: 1
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 2
            points: 40
            slots: [
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Red Squadron Veteran"
            id: 2
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 3
            points: 41
            slots: [
                "Talent"
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Jek Porkins"
            id: 3
            unique: true
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 4
            points: 45
            slots: [
                "Talent"
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Luke Skywalker"
            id: 4
            unique: true
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 5
            lightside: true
            force: 2
            points: 62
            slots: [
                "Force"
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Wedge Antilles"
            id: 5
            unique: true
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 6
            points: 55
            slots: [
                "Talent"
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Garven Dreis (X-Wing)"
            canonical_name: 'Garven Dreis'.canonicalize()
            id: 6
            unique: true
            xws: "garvendreis-t65xwing"
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 4
            points: 47
            slots: [
                "Talent"
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Biggs Darklighter"
            id: 7
            unique: true
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 3
            points: 48
            slots: [
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Edrio Two Tubes"
            id: 8
            unique: true
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 2
            points: 43
            slots: [
                "Illicit"
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Thane Kyrell"
            id: 9
            unique: true
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 5
            points: 48
            slots: [
                "Talent"
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Leevan Tenza"
            id: 10
            unique: true
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 3
            points: 44
            slots: [
                "Illicit"
                "Talent"
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "whoops"
            id: 11
            skip: true
        }
        {
            name: "Kullbee Sperado"
            id: 12
            unique: true
            faction: "Rebel Alliance"
            ship: "X-Wing"
            skill: 4
            points: 46
            slots: [
                "Illicit"
                "Talent"
                "Torpedo"
                "Astromech"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Sabine Wren (TIE Fighter)"
            canonical_name: 'Sabine Wren'.canonicalize()
            id: 13
            unique: true
            xws: "sabinewren-tielnfighter"
            faction: "Rebel Alliance"
            ship: "TIE Fighter"
            skill: 3
            points: 28
            slots: [
                "Talent"
                "Modification"
            ]
        }
        {
            name: "Ezra Bridger (TIE Fighter)"
            canonical_name: 'Ezra Bridger'.canonicalize()
            id: 14
            unique: true
            xws: "ezrabridger-tielnfighter"
            faction: "Rebel Alliance"
            ship: "TIE Fighter"
            skill: 3
            lightside: true
            force: 1
            points: 30
            slots: [
                "Force"
                "Modification"
            ]
        }
        {
            name: '"Zeb" Orrelios (TIE Fighter)'
            canonical_name: '"Zeb" Orrelios'.canonicalize()
            id: 15
            unique: true
            xws: "zeborrelios-tielnfighter"
            faction: "Rebel Alliance"
            ship: "TIE Fighter"
            skill: 2
            points: 24
            slots: [
                "Modification"
            ]
        }
        {
            name: "Captain Rex"
            id: 16
            unique: true
            faction: "Rebel Alliance"
            ship: "TIE Fighter"
            skill: 2
            points: 29
            slots: [
                "Modification"
            ]
            applies_condition: 'Suppressive Fire'.canonicalize()
        }
        {
            name: "Miranda Doni"
            id: 17
            unique: true
            faction: "Rebel Alliance"
            ship: "K-Wing"
            skill: 4
            points: 40
            slots: [
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Crew"
                "Device"
                "Device"
                "Modification"
            ]
        }
        {
            name: "Esege Tuketu"
            id: 18
            unique: true
            faction: "Rebel Alliance"
            ship: "K-Wing"
            skill: 3
            points: 44
            slots: [
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Crew"
                "Device"
                "Device"
                "Modification"
            ]
        }
        {
            name: "empty"
            id: 19
            skip: true
        }
        {
            name: "Warden Squadron Pilot"
            id: 20
            faction: "Rebel Alliance"
            ship: "K-Wing"
            skill: 2
            points: 38
            slots: [
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Crew"
                "Device"
                "Device"
                "Modification"
            ]
        }
        {
            name: "Corran Horn"
            id: 21
            unique: true
            faction: "Rebel Alliance"
            ship: "E-Wing"
            skill: 5
            points: 64
            slots: [
                "Talent"
                "Sensor"
                "Torpedo"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Gavin Darklighter"
            id: 22
            unique: true
            faction: "Rebel Alliance"
            ship: "E-Wing"
            skill: 4
            points: 60
            slots: [
                "Talent"
                "Sensor"
                "Torpedo"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Rogue Squadron Escort"
            id: 23
            faction: "Rebel Alliance"
            ship: "E-Wing"
            skill: 4
            points: 51
            slots: [
                "Talent"
                "Sensor"
                "Torpedo"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Knave Squadron Escort"
            id: 24
            faction: "Rebel Alliance"
            ship: "E-Wing"
            skill: 2
            points: 49
            slots: [
                "Sensor"
                "Torpedo"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Norra Wexley (Y-Wing)"
            id: 25
            unique: true
            canonical_name: 'Norra Wexley'.canonicalize()
            xws: "norrawexley-btla4ywing"
            faction: "Rebel Alliance"
            ship: "Y-Wing"
            skill: 5
            points: 41
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Astromech"
                "Modification"
                "Device"
                "Gunner"
            ]
        }
        {
            name: "Horton Salm"
            id: 26
            unique: true
            faction: "Rebel Alliance"
            ship: "Y-Wing"
            skill: 4
            points: 37
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Astromech"
                "Modification"
                "Device"
                "Gunner"
            ]
        }
        {
            name: '"Dutch" Vander'
            id: 27
            unique: true
            faction: "Rebel Alliance"
            ship: "Y-Wing"
            skill: 4
            points: 40
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Astromech"
                "Modification"
                "Device"
                "Gunner"
            ]
        }
        {
            name: "Evaan Verlaine"
            id: 28
            unique: true
            faction: "Rebel Alliance"
            ship: "Y-Wing"
            skill: 3
            points: 35
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Astromech"
                "Modification"
                "Device"
                "Gunner"
            ]
        }
        {
            name: "Gold Squadron Veteran"
            id: 29
            faction: "Rebel Alliance"
            ship: "Y-Wing"
            skill: 3
            points: 32
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Astromech"
                "Modification"
                "Device"
                "Gunner"
            ]
        }
        {
            name: "Gray Squadron Bomber"
            id: 30
            faction: "Rebel Alliance"
            ship: "Y-Wing"
            skill: 2
            points: 30
            slots: [
                "Turret"
                "Torpedo"
                "Astromech"
                "Modification"
                "Device"
                "Gunner"
            ]
        }
        {
            name: "Bodhi Rook"
            id: 31
            unique: true
            faction: "Rebel Alliance"
            ship: "U-Wing"
            skill: 4
            points: 48
            slots: [
                "Talent"
                "Sensor"
                "Crew"
                "Crew"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Cassian Andor"
            id: 32
            unique: true
            faction: "Rebel Alliance"
            ship: "U-Wing"
            skill: 3
            points: 51
            slots: [
                "Talent"
                "Sensor"
                "Crew"
                "Crew"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Heff Tobber"
            id: 33
            unique: true
            faction: "Rebel Alliance"
            ship: "U-Wing"
            skill: 2
            points: 44
            slots: [
                "Talent"
                "Sensor"
                "Crew"
                "Crew"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Magva Yarro"
            id: 34
            unique: true
            faction: "Rebel Alliance"
            ship: "U-Wing"
            skill: 3
            points: 50
            slots: [
                "Talent"
                "Sensor"
                "Crew"
                "Crew"
                "Modification"
                "Configuration"
                "Illicit"
            ]
        }
        {
            name: "Saw Gerrera"
            id: 35
            unique: true
            faction: "Rebel Alliance"
            ship: "U-Wing"
            skill: 4
            points: 52
            slots: [
                "Talent"
                "Sensor"
                "Crew"
                "Crew"
                "Modification"
                "Configuration"
                "Illicit"
            ]
        }
        {
            name: "Benthic Two Tubes"
            id: 36
            unique: true
            faction: "Rebel Alliance"
            ship: "U-Wing"
            skill: 2
            points: 46
            slots: [
                "Illicit"
                "Sensor"
                "Crew"
                "Crew"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Blue Squadron Scout"
            id: 37
            faction: "Rebel Alliance"
            ship: "U-Wing"
            skill: 2
            points: 43
            slots: [
                "Sensor"
                "Crew"
                "Crew"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Partisan Renegade"
            id: 38
            faction: "Rebel Alliance"
            ship: "U-Wing"
            skill: 1
            points: 43
            slots: [
                "Illicit"
                "Sensor"
                "Crew"
                "Crew"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Dash Rendar"
            id: 39
            unique: true
            faction: "Rebel Alliance"
            ship: "YT-2400"
            skill: 5
            points: 85
            slots: [
                "Talent"
                "Missile"
                "Gunner"
                "Crew"
                "Modification"
                "Title"
                "Illicit"
            ]
        }
        {
            name: '"Leebo"'
            id: 40
            unique: true
            faction: "Rebel Alliance"
            ship: "YT-2400"
            skill: 3
            points: 76
            slots: [
                "Talent"
                "Missile"
                "Gunner"
                "Modification"
                "Title"
                "Illicit"
            ]
            ship_override:
                actions: [
                    "Calculate"
                    "Lock"
                    "Rotate Arc"
                ]
        }
        {
            name: "Wild Space Fringer"
            id: 41
            faction: "Rebel Alliance"
            ship: "YT-2400"
            skill: 1
            points: 72
            slots: [
                "Missile"
                "Gunner"
                "Crew"
                "Modification"
                "Title"
                "Illicit"
            ]
        }
        {
            name: "Han Solo"
            id: 42
            unique: true
            xws: "hansolo-modifiedyt1300lightfreighter"
            faction: "Rebel Alliance"
            ship: "YT-1300"
            skill: 6
            points: 79
            slots: [
                "Talent"
                "Missile"
                "Gunner"
                "Crew"
                "Crew"
                "Modification"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Lando Calrissian"
            id: 43
            unique: true
            xws: "landocalrissian-modifiedyt1300lightfreighter"
            faction: "Rebel Alliance"
            ship: "YT-1300"
            skill: 5
            points: 78
            slots: [
                "Talent"
                "Missile"
                "Gunner"
                "Crew"
                "Crew"
                "Modification"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Chewbacca"
            id: 44
            unique: true
            faction: "Rebel Alliance"
            ship: "YT-1300"
            skill: 4
            charge: 1
            recurring: true
            points: 70
            slots: [
                "Talent"
                "Missile"
                "Gunner"
                "Crew"
                "Crew"
                "Modification"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Outer Rim Smuggler"
            id: 45
            faction: "Rebel Alliance"
            ship: "YT-1300"
            skill: 1
            points: 67
            slots: [
                "Missile"
                "Gunner"
                "Crew"
                "Crew"
                "Modification"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Jan Ors"
            id: 46
            unique: true
            faction: "Rebel Alliance"
            ship: "HWK-290"
            skill: 5
            points: 41
            slots: [
                "Talent"
                "Device"
                "Crew"
                "Modification"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Roark Garnet"
            id: 47
            unique: true
            faction: "Rebel Alliance"
            ship: "HWK-290"
            skill: 4
            points: 38
            slots: [
                "Talent"
                "Device"
                "Crew"
                "Modification"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Kyle Katarn"
            id: 48
            unique: true
            faction: "Rebel Alliance"
            ship: "HWK-290"
            skill: 3
            points: 33
            slots: [
                "Talent"
                "Device"
                "Crew"
                "Modification"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Rebel Scout"
            id: 49
            faction: "Rebel Alliance"
            ship: "HWK-290"
            skill: 2
            points: 29
            slots: [
                "Device"
                "Crew"
                "Modification"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Jake Farrell"
            id: 50
            unique: true
            faction: "Rebel Alliance"
            ship: "A-Wing"
            skill: 4
            points: 36
            slots: [
                "Talent"
                "Talent"
                "Missile"
            ]
        }
        {
            name: "Arvel Crynyd"
            id: 51
            unique: true
            faction: "Rebel Alliance"
            ship: "A-Wing"
            skill: 3
            points: 34
            slots: [
                "Talent"
                "Talent"
                "Missile"
            ]
        }
        {
            name: "Green Squadron Pilot"
            id: 52
            faction: "Rebel Alliance"
            ship: "A-Wing"
            skill: 3
            points: 32
            slots: [
                "Talent"
                "Talent"
                "Missile"
            ]
        }
        {
            name: "Phoenix Squadron Pilot"
            id: 53
            faction: "Rebel Alliance"
            ship: "A-Wing"
            skill: 1
            points: 29
            slots: [
                "Talent"
                "Missile"
            ]
        }
        {
            name: "Airen Cracken"
            id: 54
            unique: true
            faction: "Rebel Alliance"
            ship: "Z-95 Headhunter"
            skill: 5
            points: 36
            slots: [
                "Talent"
                "Missile"
                "Modification"
            ]
        }
        {
            name: "Lieutenant Blount"
            id: 55
            unique: true
            faction: "Rebel Alliance"
            ship: "Z-95 Headhunter"
            skill: 4
            points: 30
            slots: [
                "Talent"
                "Missile"
                "Modification"
            ]
        }
        {
            name: "Tala Squadron Pilot"
            id: 56
            faction: "Rebel Alliance"
            ship: "Z-95 Headhunter"
            skill: 2
            points: 24
            slots: [
                "Talent"
                "Missile"
                "Modification"
            ]
        }
        {
            name: "Bandit Squadron Pilot"
            id: 57
            faction: "Rebel Alliance"
            ship: "Z-95 Headhunter"
            skill: 1
            points: 22
            slots: [
                "Missile"
                "Modification"
            ]
        }
        {
            name: "Wullffwarro"
            id: 58
            unique: true
            faction: "Rebel Alliance"
            ship: "Auzituck Gunship"
            skill: 4
            points: 54
            slots: [
                "Talent"
                "Crew"
                "Crew"
                "Modification"
            ]
        }
        {
            name: "Lowhhrick"
            id: 59
            unique: true
            faction: "Rebel Alliance"
            ship: "Auzituck Gunship"
            skill: 3
            points: 51
            slots: [
                "Talent"
                "Crew"
                "Crew"
                "Modification"
            ]
        }
        {
            name: "Kashyyyk Defender"
            id: 60
            faction: "Rebel Alliance"
            ship: "Auzituck Gunship"
            skill: 1
            points: 42
            slots: [
                "Crew"
                "Crew"
                "Modification"
            ]
        }
        {
            name: "Hera Syndulla (VCX-100)"
            id: 61
            unique: true
            canonical_name: 'Hera Syndulla'.canonicalize()
            xws: "herasyndulla-vcx100lightfreighter"
            faction: "Rebel Alliance"
            ship: "VCX-100"
            skill: 5
            points: 72
            slots: [
                "Talent"
                "Sensor"
                "Torpedo"
                "Turret"
                "Crew"
                "Crew"
                "Modification"
                "Gunner"
                "Title"
            ]
        }
        {
            name: "Kanan Jarrus"
            id: 62
            unique: true
            faction: "Rebel Alliance"
            ship: "VCX-100"
            skill: 3
            lightside: true
            force: 2
            points: 76
            slots: [
                "Force"
                "Sensor"
                "Torpedo"
                "Turret"
                "Crew"
                "Crew"
                "Modification"
                "Gunner"
                "Title"
            ]
        }
        {
            name: '"Chopper"'
            id: 63
            unique: true
            faction: "Rebel Alliance"
            ship: "VCX-100"
            skill: 2
            points: 67
            slots: [
                "Torpedo"
                "Sensor"
                "Turret"
                "Crew"
                "Crew"
                "Modification"
                "Gunner"
                "Title"
            ]
            ship_override:
                actions: [
                    "Calculate"
                    "Lock"
                    "Reinforce"
                ]
        }
        {
            name: "Lothal Rebel"
            id: 64
            faction: "Rebel Alliance"
            ship: "VCX-100"
            skill: 2
            points: 67
            slots: [
                "Torpedo"
                "Sensor"
                "Turret"
                "Crew"
                "Crew"
                "Modification"
                "Gunner"
                "Title"
            ]
        }
        {
            name: "Hera Syndulla"
            id: 65
            unique: true
            faction: "Rebel Alliance"
            ship: "Attack Shuttle"
            skill: 5
            points: 38
            slots: [
                "Talent"
                "Crew"
                "Modification"
                "Turret"
                "Title"
            ]
        }
        {
            name: "Sabine Wren"
            canonical_name: 'Sabine Wren'.canonicalize()
            id: 66
            unique: true
            faction: "Rebel Alliance"
            ship: "Attack Shuttle"
            skill: 3
            points: 41
            slots: [
                "Talent"
                "Crew"
                "Modification"
                "Turret"
                "Title"
            ]
        }
        {
            name: "Ezra Bridger"
            id: 67
            unique: true
            faction: "Rebel Alliance"
            ship: "Attack Shuttle"
            skill: 3
            lightside: true
            force: 1
            points: 40
            slots: [
                "Force"
                "Crew"
                "Modification"
                "Turret"
                "Title"
            ]
        }

        {
            name: '"Zeb" Orrelios'
            id: 68
            unique: true
            faction: "Rebel Alliance"
            ship: "Attack Shuttle"
            skill: 2
            points: 32
            slots: [
                "Crew"
                "Modification"
                "Turret"
                "Title"
            ]
        }
        {
            name: "Fenn Rau (Sheathipede)"
            id: 69
            unique: true
            xws: "fennrau-sheathipedeclassshuttle"
            faction: "Rebel Alliance"
            ship: "Sheathipede-Class Shuttle"
            skill: 6
            points: 50
            slots: [
                "Talent"
                "Crew"
                "Modification"
                "Astromech"
                "Title"
            ]
        }
        {
            name: "Ezra Bridger (Sheathipede)"
            canonical_name: 'Ezra Bridger'.canonicalize()
            id: 70
            unique: true
            xws: "ezrabridger-sheathipedeclassshuttle"
            faction: "Rebel Alliance"
            ship: "Sheathipede-Class Shuttle"
            skill: 3
            force: 1
            points: 40
            slots: [
                "Force"
                "Crew"
                "Modification"
                "Astromech"
                "Title"
            ]
        }
        {
            name: '"Zeb" Orrelios (Sheathipede)'
            canonical_name: '"Zeb" Orrelios'.canonicalize()
            id: 71
            unique: true
            xws: "zeborrelios-sheathipedeclassshuttle"
            faction: "Rebel Alliance"
            ship: "Sheathipede-Class Shuttle"
            skill: 2
            points: 33
            slots: [
                "Talent"
                "Crew"
                "Modification"
                "Astromech"
                "Title"
            ]
        }
        {
            name: "AP-5"
            id: 72
            unique: true
            faction: "Rebel Alliance"
            ship: "Sheathipede-Class Shuttle"
            skill: 1
            points:32
            slots: [
                "Talent"
                "Crew"
                "Modification"
                "Astromech"
                "Title"
            ]
            ship_override:
                actions: [
                    "Calculate"
                    "Coordinate"
                ]
        }
        {
            name: "Braylen Stramm"
            id: 73
            unique: true
            faction: "Rebel Alliance"
            ship: "B-Wing"
            skill: 4
            points: 52
            slots: [
                "Talent"
                "Sensor"
                "Cannon"
                "Cannon"
                "Torpedo"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Ten Numb"
            id: 74
            unique: true
            faction: "Rebel Alliance"
            ship: "B-Wing"
            skill: 4
            points: 48
            slots: [
                "Talent"
                "Sensor"
                "Cannon"
                "Cannon"
                "Torpedo"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Blade Squadron Veteran"
            id: 75
            faction: "Rebel Alliance"
            ship: "B-Wing"
            skill: 3
            points: 42
            slots: [
                "Talent"
                "Sensor"
                "Cannon"
                "Cannon"
                "Torpedo"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Blue Squadron Pilot"
            id: 76
            faction: "Rebel Alliance"
            ship: "B-Wing"
            skill: 2
            points: 41
            slots: [
                "Sensor"
                "Cannon"
                "Cannon"
                "Torpedo"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Norra Wexley"
            id: 77
            unique: true
            faction: "Rebel Alliance"
            ship: "ARC-170"
            skill: 5
            points: 55
            slots: [
                "Talent"
                "Torpedo"
                "Crew"
                "Gunner"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Shara Bey"
            id: 78
            unique: true
            faction: "Rebel Alliance"
            ship: "ARC-170"
            skill: 4
            points: 50
            slots: [
                "Talent"
                "Torpedo"
                "Crew"
                "Gunner"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Garven Dreis"
            id: 79
            unique: true
            faction: "Rebel Alliance"
            ship: "ARC-170"
            skill: 4
            points: 49
            slots: [
                "Talent"
                "Torpedo"
                "Crew"
                "Gunner"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Ibtisam"
            id: 80
            unique: true
            faction: "Rebel Alliance"
            ship: "ARC-170"
            skill: 3
            points: 46
            slots: [
                "Talent"
                "Torpedo"
                "Crew"
                "Gunner"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "IG-88A"
            id: 81
            unique: true
            faction: "Scum and Villainy"
            ship: "Aggressor"
            skill: 4
            points: 66
            slots: [
                "Talent"
                "Sensor"
                "Cannon"
                "Cannon"
                "Device"
                "Illicit"
                "Modification"
                "Title"
            ]
        }
        {
            name: "IG-88B"
            id: 82
            unique: true
            faction: "Scum and Villainy"
            ship: "Aggressor"
            skill: 4
            points: 62
            slots: [
                "Talent"
                "Sensor"
                "Cannon"
                "Cannon"
                "Device"
                "Illicit"
                "Modification"
                "Title"
                ]
        }
        {
            name: "IG-88C"
            id: 83
            unique: true
            faction: "Scum and Villainy"
            ship: "Aggressor"
            skill: 4
            points: 63
            slots: [
                "Talent"
                "Sensor"
                "Cannon"
                "Cannon"
                "Device"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "IG-88D"
            id: 84
            unique: true
            faction: "Scum and Villainy"
            ship: "Aggressor"
            skill: 4
            points: 62
            slots: [
                "Talent"
                "Sensor"
                "Cannon"
                "Cannon"
                "Device"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Kavil"
            id: 85
            unique: true
            faction: "Scum and Villainy"
            ship: "Y-Wing"
            skill: 5
            points: 43
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Gunner"
                "Astromech"
                "Device"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Drea Renthal"
            id: 86
            unique: true
            faction: "Scum and Villainy"
            ship: "Y-Wing"
            skill: 4
            points: 49
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Gunner"
                "Astromech"
                "Device"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Hired Gun"
            id: 87
            faction: "Scum and Villainy"
            ship: "Y-Wing"
            skill: 2
            points: 32
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Gunner"
                "Astromech"
                "Device"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Crymorah Goon"
            id: 88
            faction: "Scum and Villainy"
            ship: "Y-Wing"
            skill: 1
            points: 30
            slots: [
                "Turret"
                "Torpedo"
                "Gunner"
                "Astromech"
                "Device"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Han Solo (Scum)"
            id: 89
            unique: true
            xws: "hansolo"
            faction: "Scum and Villainy"
            ship: "Customized YT-1300"
            skill: 6
            points: 48
            slots: [
                "Talent"
                "Missile"
                "Crew"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Lando Calrissian (Scum)"
            id: 90
            unique: true
            xws: "landocalrissian"
            faction: "Scum and Villainy"
            ship: "Customized YT-1300"
            skill: 4
            points: 42
            slots: [
                "Talent"
                "Missile"
                "Crew"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
            ]
        }
        {
            name: "L3-37"
            id: 91
            unique: true
            faction: "Scum and Villainy"
            ship: "Customized YT-1300"
            skill: 2
            points: 41
            slots: [
                "Missile"
                "Crew"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
            ]
            ship_override:
                actions: [
                    "Calculate"
                    "Lock"
                    "Rotate Arc"
                ]
        }
        {
            name: "Freighter Captain"
            id: 92
            faction: "Scum and Villainy"
            ship: "Customized YT-1300"
            skill: 1
            points: 41
            slots: [
                "Missile"
                "Crew"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Lando Calrissian (Scum) (Escape Craft)"
            canonical_name: 'Lando Calrissian (Scum)'.canonicalize()
            id: 93
            unique: true
            xws: "landocalrissian-escapecraft"
            faction: "Scum and Villainy"
            ship: "Escape Craft"
            skill: 4
            points: 29
            slots: [
                "Talent"
                "Crew"
                "Modification"
              ]
        }
        {
            name: "Outer Rim Pioneer"
            id: 94
            unique: true
            faction: "Scum and Villainy"
            ship: "Escape Craft"
            skill: 3
            points: 28
            slots: [
                "Talent"
                "Crew"
                "Modification"
              ]
        }
        {
            name: "L3-37 (Escape Craft)"
            canonical_name: 'L3-37'.canonicalize()
            id: 95
            unique: true
            xws: "l337-escapecraft"
            faction: "Scum and Villainy"
            ship: "Escape Craft"
            skill: 2
            points: 26
            slots: [
                "Talent"
                "Crew"
                "Modification"
              ]
            ship_override:
                actions: [
                    "Calculate"
                    "Barrel Roll"
                ]
        }
        {
            name: "Autopilot Drone"
            id: 96
            unique: true
            faction: "Scum and Villainy"
            ship: "Escape Craft"
            skill: 1
            charge: 3
            points: 12
            slots: [
            ]
            ship_override:
                actions: [
                    "Calculate"
                    "Barrel Roll"
                ]
        }
        {
            name: "Fenn Rau"
            id: 97
            unique: true
            faction: "Scum and Villainy"
            ship: "Fang Fighter"
            skill: 6
            points: 68
            slots: [
                "Talent"
                "Torpedo"
              ]
        }
        {
            name: "Old Teroch"
            id: 98
            unique: true
            faction: "Scum and Villainy"
            ship: "Fang Fighter"
            skill: 5
            points: 56
            slots: [
                "Talent"
                "Torpedo"
              ]
        }
        {
            name: "Kad Solus"
            id: 99
            unique: true
            faction: "Scum and Villainy"
            ship: "Fang Fighter"
            skill: 4
            points: 54
            slots: [
                "Talent"
                "Torpedo"
              ]
        }
        {
            name: "Joy Rekkoff"
            id: 100
            unique: true
            faction: "Scum and Villainy"
            ship: "Fang Fighter"
            skill: 4
            points: 52
            slots: [
                "Talent"
                "Torpedo"
              ]
        }
        {
            name: "Skull Squadron Pilot"
            id: 101
            faction: "Scum and Villainy"
            ship: "Fang Fighter"
            skill: 4
            points: 47
            slots: [
                "Talent"
                "Torpedo"
              ]
        }
        {
            name: "Zealous Recruit"
            id: 102
            faction: "Scum and Villainy"
            ship: "Fang Fighter"
            skill: 1
            points: 41
            slots: [
                "Torpedo"
              ]
        }
        {
            name: "Boba Fett"
            id: 103
            unique: true
            faction: "Scum and Villainy"
            ship: "Firespray-31"
            skill: 5
            points: 86
            slots: [
                "Talent"
                "Cannon"
                "Missile"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Emon Azzameen"
            id: 104
            unique: true
            faction: "Scum and Villainy"
            ship: "Firespray-31"
            skill: 4
            points: 71
            slots: [
                "Talent"
                "Cannon"
                "Missile"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Kath Scarlet"
            id: 105
            unique: true
            faction: "Scum and Villainy"
            ship: "Firespray-31"
            skill: 4
            points: 72
            slots: [
                "Talent"
                "Cannon"
                "Missile"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Koshka Frost"
            id: 106
            unique: true
            faction: "Scum and Villainy"
            ship: "Firespray-31"
            skill: 3
            points: 70
            slots: [
                "Talent"
                "Cannon"
                "Missile"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Krassis Trelix"
            id: 107
            unique: true
            faction: "Scum and Villainy"
            ship: "Firespray-31"
            skill: 3
            points: 65
            slots: [
                "Talent"
                "Cannon"
                "Missile"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Bounty Hunter"
            id: 108
            faction: "Scum and Villainy"
            ship: "Firespray-31"
            skill: 2
            points: 62
            slots: [
                "Cannon"
                "Missile"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "4-LOM"
            id: 109
            unique: true
            faction: "Scum and Villainy"
            ship: "G-1A Starfighter"
            skill: 3
            points: 49
            slots: [
                "Talent"
                "Sensor"
                "Crew"
                "Illicit"
                "Modification"
                "Title"
              ]
            ship_override:
                actions: [
                    "Calculate"
                    "Lock"
                    "Jam"
                ]

        }
        {
            name: "Zuckuss"
            id: 110
            unique: true
            faction: "Scum and Villainy"
            ship: "G-1A Starfighter"
            skill: 3
            points: 45
            slots: [
                "Talent"
                "Sensor"
                "Crew"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Gand Findsman"
            id: 111
            faction: "Scum and Villainy"
            ship: "G-1A Starfighter"
            skill: 1
            points: 41
            slots: [
                "Sensor"
                "Crew"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Palob Godalhi"
            id: 112
            unique: true
            faction: "Scum and Villainy"
            ship: "HWK-290"
            skill: 3
            points: 40
            slots: [
                "Talent"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Dace Bonearm"
            id: 113
            unique: true
            faction: "Scum and Villainy"
            ship: "HWK-290"
            skill: 4
            charge: 3
            recurring: true
            points: 31
            slots: [
                "Talent"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Torkil Mux"
            id: 114
            unique: true
            faction: "Scum and Villainy"
            ship: "HWK-290"
            skill: 2
            points: 38
            slots: [
                "Crew"
                "Device"
                "Illicit"
                "Modification"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Dengar"
            id: 115
            unique: true
            faction: "Scum and Villainy"
            ship: "JumpMaster 5000"
            skill: 6
            charge: 1
            recurring: true
            points: 53
            slots: [
                "Talent"
                "Torpedo"
                "Cannon"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Tel Trevura"
            id: 116
            unique: true
            faction: "Scum and Villainy"
            ship: "JumpMaster 5000"
            skill: 4
            charge: 1
            points: 44
            slots: [
                "Talent"
                "Torpedo"
                "Cannon"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Manaroo"
            id: 117
            unique: true
            faction: "Scum and Villainy"
            ship: "JumpMaster 5000"
            skill: 3
            points: 45
            slots: [
                "Talent"
                "Torpedo"
                "Cannon"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Contracted Scout"
            id: 118
            faction: "Scum and Villainy"
            ship: "JumpMaster 5000"
            skill: 2
            points: 41
            slots: [
                "Torpedo"
                "Cannon"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Talonbane Cobra"
            id: 119
            unique: true
            faction: "Scum and Villainy"
            ship: "Kihraxz Fighter"
            skill: 5
            points: 50
            slots: [
                "Talent"
                "Missile"
                "Illicit"
                "Illicit"
                "Modification"
                "Modification"
              ]
        }
        {
            name: "Graz"
            id: 120
            unique: true
            faction: "Scum and Villainy"
            ship: "Kihraxz Fighter"
            skill: 4
            points: 46
            slots: [
                "Talent"
                "Missile"
                "Illicit"
                "Illicit"
                "Modification"
                "Modification"
              ]
        }
        {
            name: "Viktor Hel"
            id: 121
            unique: true
            faction: "Scum and Villainy"
            ship: "Kihraxz Fighter"
            skill: 4
            points: 44
            slots: [
                "Talent"
                "Missile"
                "Illicit"
                "Illicit"
                "Modification"
                "Modification"
              ]
        }
        {
            name: "Captain Jostero"
            id: 122
            unique: true
            faction: "Scum and Villainy"
            ship: "Kihraxz Fighter"
            skill: 3
            points: 42
            slots: [
                "Missile"
                "Illicit"
                "Illicit"
                "Modification"
                "Modification"
              ]
        }
        {
            name: "Black Sun Ace"
            id: 123
            faction: "Scum and Villainy"
            ship: "Kihraxz Fighter"
            skill: 3
            points: 40
            slots: [
                "Talent"
                "Missile"
                "Illicit"
                "Illicit"
                "Modification"
                "Modification"
              ]
        }
        {
            name: "Cartel Marauder"
            id: 124
            faction: "Scum and Villainy"
            ship: "Kihraxz Fighter"
            skill: 2
            points: 38
            slots: [
                "Missile"
                "Illicit"
                "Illicit"
                "Modification"
                "Modification"
              ]
        }
        {
            name: "Asajj Ventress"
            id: 125
            unique: true
            faction: "Scum and Villainy"
            ship: "Lancer-Class Pursuit Craft"
            skill: 4
            points: 69
            force: 2
            darkside: true
            slots: [
                "Force"
                "Crew"
                "Illicit"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Ketsu Onyo"
            id: 126
            unique: true
            faction: "Scum and Villainy"
            ship: "Lancer-Class Pursuit Craft"
            skill: 5
            points: 67
            slots: [
                "Talent"
                "Crew"
                "Illicit"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Sabine Wren (Scum)"
            id: 127
            unique: true
            xws: "sabinewren-lancerclasspursuitcraft"
            faction: "Scum and Villainy"
            ship: "Lancer-Class Pursuit Craft"
            skill: 3
            points: 59
            slots: [
                "Talent"
                "Crew"
                "Illicit"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Shadowport Hunter"
            id: 128
            faction: "Scum and Villainy"
            ship: "Lancer-Class Pursuit Craft"
            skill: 2
            points: 55
            slots: [
                "Crew"
                "Illicit"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Torani Kulda"
            id: 129
            unique: true
            faction: "Scum and Villainy"
            ship: "M12-L Kimogila Fighter"
            skill: 4
            points: 48
            slots: [
                "Talent"
                "Torpedo"
                "Missile"
                "Astromech"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Dalan Oberos"
            id: 130
            unique: true
            faction: "Scum and Villainy"
            ship: "M12-L Kimogila Fighter"
            skill: 3
            charge: 2
            points: 45
            slots: [
                "Talent"
                "Torpedo"
                "Missile"
                "Astromech"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Cartel Executioner"
            id: 131
            faction: "Scum and Villainy"
            ship: "M12-L Kimogila Fighter"
            skill: 3
            points: 41
            slots: [
                "Talent"
                "Torpedo"
                "Missile"
                "Astromech"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Serissu"
            id: 132
            unique: true
            faction: "Scum and Villainy"
            ship: "M3-A Interceptor"
            skill: 5
            points: 41
            slots: [
                "Talent"
                "Modification"
                "HardpointShip"
              ]
        }
        {
            name: "Genesis Red"
            id: 133
            unique: true
            faction: "Scum and Villainy"
            ship: "M3-A Interceptor"
            skill: 4
            points: 31
            slots: [
                "Talent"
                "Modification"
                "HardpointShip"
              ]
        }
        {
            name: "Laetin A'shera"
            id: 134
            unique: true
            faction: "Scum and Villainy"
            ship: "M3-A Interceptor"
            skill: 3
            points: 30
            slots: [
                "Talent"
                "Modification"
                "HardpointShip"
              ]
        }
        {
            name: "Quinn Jast"
            id: 135
            unique: true
            faction: "Scum and Villainy"
            ship: "M3-A Interceptor"
            skill: 3
            points: 31
            slots: [
                "Talent"
                "Modification"
                "HardpointShip"
              ]
        }
        {
            name: "Tansarii Point Veteran"
            id: 136
            faction: "Scum and Villainy"
            ship: "M3-A Interceptor"
            skill: 3
            points: 29
            slots: [
                "Talent"
                "Modification"
                "HardpointShip"
              ]
        }
        {
            name: "Inaldra"
            id: 137
            unique: true
            faction: "Scum and Villainy"
            ship: "M3-A Interceptor"
            skill: 2
            points: 30
            slots: [
                "Modification"
                "HardpointShip"
              ]
        }
        {
            name: "Sunny Bounder"
            id: 138
            unique: true
            faction: "Scum and Villainy"
            ship: "M3-A Interceptor"
            skill: 1
            points: 27
            slots: [
                "Modification"
                "HardpointShip"
              ]
        }
        {
            name: "Cartel Spacer"
            id: 139
            faction: "Scum and Villainy"
            ship: "M3-A Interceptor"
            skill: 1
            points: 25
            slots: [
                "Modification"
                "HardpointShip"
              ]
        }
        {
            name: "Constable Zuvio"
            id: 140
            unique: true
            faction: "Scum and Villainy"
            ship: "Quadjumper"
            skill: 4
            points: 30
            slots: [
                "Talent"
                "Tech"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Sarco Plank"
            id: 141
            unique: true
            faction: "Scum and Villainy"
            ship: "Quadjumper"
            skill: 2
            points: 29
            slots: [
                "Tech"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Unkar Plutt"
            id: 142
            unique: true
            faction: "Scum and Villainy"
            ship: "Quadjumper"
            skill: 2
            points: 29
            slots: [
                "Tech"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Jakku Gunrunner"
            id: 143
            faction: "Scum and Villainy"
            ship: "Quadjumper"
            skill: 1
            points: 29
            slots: [
                "Tech"
                "Crew"
                "Device"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Captain Nym"
            id: 144
            unique: true
            faction: "Scum and Villainy"
            ship: "Scurrg H-6 Bomber"
            skill: 5
            charge: 1
            recurring: true
            points: 47
            slots: [
                "Talent"
                "Turret"
                "Crew"
                "Gunner"
                "Device"
                "Device"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Sol Sixxa"
            id: 145
            unique: true
            faction: "Scum and Villainy"
            ship: "Scurrg H-6 Bomber"
            skill: 3
            points: 46
            slots: [
                "Talent"
                "Turret"
                "Crew"
                "Gunner"
                "Device"
                "Device"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Lok Revenant"
            id: 146
            faction: "Scum and Villainy"
            ship: "Scurrg H-6 Bomber"
            skill: 2
            points: 45
            slots: [
                "Turret"
                "Crew"
                "Gunner"
                "Device"
                "Device"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Guri"
            id: 147
            unique: true
            faction: "Scum and Villainy"
            ship: "StarViper"
            skill: 5
            points: 64
            slots: [
                "Talent"
                "Sensor"
                "Torpedo"
                "Modification"
                "Title"
              ]
            ship_override:
                actions: [
                    "Calculate"
                    "Lock"
                    "Barrel Roll"
                    "R> Calculate"
                    "Boost"
                    "R> Calculate"
                ]
        }
        {
            name: "Prince Xizor"
            id: 148
            unique: true
            faction: "Scum and Villainy"
            ship: "StarViper"
            skill: 4
            points: 54
            slots: [
                "Talent"
                "Sensor"
                "Torpedo"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Dalan Oberos (StarViper)"
            id: 149
            unique: true
            xws: "dalanoberos-starviperclassattackplatform"
            faction: "Scum and Villainy"
            ship: "StarViper"
            skill: 4
            points: 54
            slots: [
                "Talent"
                "Sensor"
                "Torpedo"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Black Sun Assassin"
            id: 150
            faction: "Scum and Villainy"
            ship: "StarViper"
            skill: 3
            points: 48
            slots: [
                "Talent"
                "Sensor"
                "Torpedo"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Black Sun Enforcer"
            id: 151
            faction: "Scum and Villainy"
            ship: "StarViper"
            skill: 2
            points: 45
            slots: [
                "Sensor"
                "Torpedo"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Moralo Eval"
            id: 152
            unique: true
            faction: "Scum and Villainy"
            ship: "YV-666"
            skill: 4
            charge: 2
            points: 66
            slots: [
                "Talent"
                "Cannon"
                "Missile"
                "Crew"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Bossk"
            id: 153
            unique: true
            faction: "Scum and Villainy"
            ship: "YV-666"
            skill: 4
            points: 60
            slots: [
                "Talent"
                "Cannon"
                "Missile"
                "Crew"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Latts Razzi"
            id: 154
            unique: true
            faction: "Scum and Villainy"
            ship: "YV-666"
            skill: 3
            points: 56
            slots: [
                "Talent"
                "Cannon"
                "Missile"
                "Crew"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Trandoshan Slaver"
            id: 155
            faction: "Scum and Villainy"
            ship: "YV-666"
            skill: 2
            points: 51
            slots: [
                "Cannon"
                "Missile"
                "Crew"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
              ]
        }
        {
            name: "N'dru Suhlak"
            id: 156
            unique: true
            faction: "Scum and Villainy"
            ship: "Z-95 Headhunter"
            skill: 4
            points: 30
            slots: [
                "Talent"
                "Missile"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Kaa'to Leeachos"
            id: 157
            unique: true
            faction: "Scum and Villainy"
            ship: "Z-95 Headhunter"
            skill: 3
            points: 27
            slots: [
                "Talent"
                "Missile"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Black Sun Soldier"
            id: 158
            faction: "Scum and Villainy"
            ship: "Z-95 Headhunter"
            skill: 3
            points: 24
            slots: [
                "Talent"
                "Missile"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Binayre Pirate"
            id: 159
            faction: "Scum and Villainy"
            ship: "Z-95 Headhunter"
            skill: 1
            points: 22
            slots: [
                "Missile"
                "Illicit"
                "Modification"
              ]
        }
        {
            name: "Nashtah Pup"
            id: 160
            unique: true
            faction: "Scum and Villainy"
            ship: "Z-95 Headhunter"
            skill: 0
            points: 6
            slots: [
                "Missile"
                "Illicit"
                "Modification"
              ]
            restriction_func: (ship) ->
                builder = ship.builder
                for t, things of builder.uniques_in_use
                    if t != 'Slot'
                        return true if 'houndstooth' in (thing.canonical_name.getXWSBaseName() for thing in things)
                false

        }
        {
            name: "Major Vynder"
            id: 161
            unique: true
            faction: "Galactic Empire"
            ship: "Alpha-Class Star Wing"
            skill: 4
            points: 40
            slots: [
                "Talent"
                "Sensor"
                "Torpedo"
                "Missile"
                "Modification"
                "Configuration"
              ]
        }
        {
            name: "Lieutenant Karsabi"
            id: 162
            unique: true
            faction: "Galactic Empire"
            ship: "Alpha-Class Star Wing"
            skill: 3
            points: 36
            slots: [
                "Talent"
                "Sensor"
                "Torpedo"
                "Missile"
                "Modification"
                "Configuration"
              ]
        }
        {
            name: "Rho Squadron Pilot"
            id: 163
            faction: "Galactic Empire"
            ship: "Alpha-Class Star Wing"
            skill: 3
            points: 34
            slots: [
                "Talent"
                "Sensor"
                "Torpedo"
                "Missile"
                "Modification"
                "Configuration"
              ]
        }
        {
            name: "Nu Squadron Pilot"
            id: 164
            faction: "Galactic Empire"
            ship: "Alpha-Class Star Wing"
            skill: 2
            points: 32
            slots: [
                "Sensor"
                "Torpedo"
                "Missile"
                "Modification"
                "Configuration"
              ]
        }
        {
            name: "Captain Kagi"
            id: 165
            unique: true
            faction: "Galactic Empire"
            ship: "Lambda-Class Shuttle"
            skill: 4
            points: 48
            slots: [
                "Sensor"
                "Cannon"
                "Crew"
                "Crew"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Lieutenant Sai"
            id: 166
            unique: true
            faction: "Galactic Empire"
            ship: "Lambda-Class Shuttle"
            skill: 3
            points: 47
            slots: [
                "Sensor"
                "Cannon"
                "Crew"
                "Crew"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Colonel Jendon"
            id: 167
            unique: true
            faction: "Galactic Empire"
            ship: "Lambda-Class Shuttle"
            skill: 3
            charge: 2
            points: 49
            slots: [
                "Sensor"
                "Cannon"
                "Crew"
                "Crew"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Omicron Group Pilot"
            id: 168
            faction: "Galactic Empire"
            ship: "Lambda-Class Shuttle"
            skill: 1
            points: 43
            slots: [
                "Sensor"
                "Cannon"
                "Crew"
                "Crew"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Grand Inquisitor"
            id: 169
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Advanced Prototype"
            skill: 5
            points: 52
            force: 2
            darkside: true
            slots: [
                "Force"
                "Sensor"
                "Missile"
              ]
        }
        {
            name: "Seventh Sister"
            id: 170
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Advanced Prototype"
            skill: 4
            points: 43
            force: 2
            darkside: true
            slots: [
                "Force"
                "Sensor"
                "Missile"
              ]
        }
        {
            name: "Inquisitor"
            id: 171
            faction: "Galactic Empire"
            ship: "TIE Advanced Prototype"
            skill: 3
            points: 36
            force: 1
            darkside: true
            slots: [
                "Force"
                "Sensor"
                "Missile"
              ]
        }
        {
            name: "Baron of the Empire"
            id: 172
            faction: "Galactic Empire"
            ship: "TIE Advanced Prototype"
            skill: 3
            points: 28
            slots: [
                "Talent"
                "Sensor"
                "Missile"
              ]
        }
        {
            name: "Darth Vader"
            id: 173
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Advanced"
            skill: 6
            darkside: true
            points: 67
            force: 3
            slots: [
                "Force"
                "Sensor"
                "Missile"
                "Modification"
              ]
        }
        {
            name: "Maarek Stele"
            id: 174
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Advanced"
            skill: 5
            points: 45
            slots: [
                "Talent"
                "Sensor"
                "Missile"
                "Modification"
              ]
        }
        {
            name: "Ved Foslo"
            id: 175
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Advanced"
            skill: 4
            points: 44
            slots: [
                "Talent"
                "Sensor"
                "Missile"
                "Modification"
              ]
        }
        {
            name: "Zertik Strom"
            id: 176
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Advanced"
            skill: 3
            points: 41
            slots: [
                "Sensor"
                "Missile"
                "Modification"
              ]
        }
        {
            name: "Storm Squadron Ace"
            id: 177
            faction: "Galactic Empire"
            ship: "TIE Advanced"
            skill: 3
            points: 39
            slots: [
                "Talent"
                "Sensor"
                "Missile"
                "Modification"
              ]
        }
        {
            name: "Tempest Squadron Pilot"
            id: 178
            faction: "Galactic Empire"
            ship: "TIE Advanced"
            skill: 2
            points: 36
            slots: [
                "Sensor"
                "Missile"
                "Modification"
              ]
        }
        {
            name: "Soontir Fel"
            id: 179
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Interceptor"
            skill: 6
            points: 54
            slots: [
                "Talent"
                "Modification"
                "Modification"
              ]
        }
        {
            name: "Turr Phennir"
            id: 180
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Interceptor"
            skill: 4
            points: 42
            slots: [
                "Talent"
                "Modification"
                "Modification"
              ]
        }
        {
            name: "Saber Squadron Ace"
            id: 181
            faction: "Galactic Empire"
            ship: "TIE Interceptor"
            skill: 4
            points: 36
            slots: [
                "Talent"
                "Modification"
                "Modification"
              ]
        }
        {
            name: "Alpha Squadron Pilot"
            id: 182
            faction: "Galactic Empire"
            ship: "TIE Interceptor"
            skill: 1
            points: 31
            slots: [
                "Modification"
                "Modification"
              ]
        }
        {
            name: "Major Vermeil"
            id: 183
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Reaper"
            skill: 4
            points: 49
            slots: [
                "Talent"
                "Crew"
                "Crew"
                "Modification"
              ]
        }
        {
            name: "Captain Feroph"
            id: 184
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Reaper"
            skill: 3
            points: 47
            slots: [
                "Talent"
                "Crew"
                "Crew"
                "Modification"
              ]
        }
        {
            name: '"Vizier"'
            id: 185
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Reaper"
            skill: 2
            points: 45
            slots: [
                "Crew"
                "Crew"
                "Modification"
              ]
        }
        {
            name: "Scarif Base Pilot"
            id: 186
            faction: "Galactic Empire"
            ship: "TIE Reaper"
            skill: 1
            points: 39
            slots: [
                "Crew"
                "Crew"
                "Modification"
              ]
        }
        {
            name: "Lieutenant Kestal"
            id: 187
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Aggressor"
            skill: 4
            points: 30
            slots: [
                "Talent"
                "Turret"
                "Missile"
                "Missile"
                "Gunner"
                "Modification"
              ]
        }
        {
            name: '"Double Edge"'
            id: 188
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Aggressor"
            skill: 2
            points: 28
            slots: [
                "Talent"
                "Turret"
                "Missile"
                "Missile"
                "Gunner"
                "Modification"
              ]
        }
        {
            name: "Onyx Squadron Scout"
            id: 189
            faction: "Galactic Empire"
            ship: "TIE Aggressor"
            skill: 3
            points: 28
            slots: [
                "Talent"
                "Turret"
                "Missile"
                "Missile"
                "Gunner"
                "Modification"
              ]
        }
        {
            name: "Sienar Specialist"
            id: 190
            faction: "Galactic Empire"
            ship: "TIE Aggressor"
            skill: 2
            points: 26
            slots: [
                "Turret"
                "Missile"
                "Missile"
                "Gunner"
                "Modification"
              ]
        }
        {
            name: '"Redline"'
            id: 191
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Punisher"
            skill: 5
            points: 51
            slots: [
                "Sensor"
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Device"
                "Device"
                "Modification"
              ]
        }
        {
            name: '"Deathrain"'
            id: 192
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Punisher"
            skill: 4
            points: 43
            slots: [
                "Sensor"
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Device"
                "Device"
                "Modification"
              ]
        }
        {
            name: "Cutlass Squadron Pilot"
            id: 193
            faction: "Galactic Empire"
            ship: "TIE Punisher"
            skill: 2
            points: 35
            slots: [
                "Sensor"
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Device"
                "Device"
                "Modification"
              ]
        }
        {
            name: "Colonel Vessery"
            id: 194
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Defender"
            skill: 4
            points: 82
            slots: [
                "Talent"
                "Sensor"
                "Cannon"
                "Missile"
              ]
        }
        {
            name: "Countess Ryad"
            id: 195
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Defender"
            skill: 4
            points: 80
            slots: [
                "Talent"
                "Sensor"
                "Cannon"
                "Missile"
              ]
        }
        {
            name: "Rexler Brath"
            id: 196
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Defender"
            skill: 5
            points: 79
            slots: [
                "Talent"
                "Sensor"
                "Cannon"
                "Missile"
              ]
        }
        {
            name: "Onyx Squadron Ace"
            id: 197
            faction: "Galactic Empire"
            ship: "TIE Defender"
            skill: 4
            points: 74
            slots: [
                "Talent"
                "Sensor"
                "Cannon"
                "Missile"
              ]
        }
        {
            name: "Delta Squadron Pilot"
            id: 198
            faction: "Galactic Empire"
            ship: "TIE Defender"
            skill: 1
            points: 67
            slots: [
                "Sensor"
                "Cannon"
                "Missile"
              ]
        }
        {
            name: '"Whisper"'
            id: 199
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Phantom"
            skill: 5
            points: 60
            slots: [
                "Talent"
                "Sensor"
                "Gunner"
                "Modification"
              ]
        }
        {
            name: '"Echo"'
            id: 200
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Phantom"
            skill: 4
            points: 51
            slots: [
                "Talent"
                "Sensor"
                "Gunner"
                "Modification"
              ]
        }
        {
            name: "Sigma Squadron Ace"
            id: 201
            faction: "Galactic Empire"
            ship: "TIE Phantom"
            skill: 4
            points: 48
            slots: [
                "Talent"
                "Sensor"
                "Gunner"
                "Modification"
              ]
        }
        {
            name: "Imdaar Test Pilot"
            id: 202
            faction: "Galactic Empire"
            ship: "TIE Phantom"
            skill: 3
            points: 43
            slots: [
                "Sensor"
                "Gunner"
                "Modification"
              ]
        }
        {
            name: "Captain Jonus"
            id: 203
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Bomber"
            skill: 4
            points: 45
            slots: [
                "Talent"
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Device"
                "Device"
                "Modification"
              ]
        }
        {
            name: "Major Rhymer"
            id: 204
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Bomber"
            skill: 4
            points: 37
            slots: [
                "Talent"
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Device"
                "Device"
                "Modification"
              ]
        }
        {
            name: "Tomax Bren"
            id: 205
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Bomber"
            skill: 5
            points: 35
            slots: [
                "Talent"
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Device"
                "Device"
                "Modification"
              ]
        }
        {
            name: '"Deathfire"'
            id: 206
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Bomber"
            skill: 2
            points: 32
            slots: [
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Device"
                "Device"
                "Modification"
              ]
        }
        {
            name: "Gamma Squadron Ace"
            id: 207
            faction: "Galactic Empire"
            ship: "TIE Bomber"
            skill: 3
            points: 30
            slots: [
                "Talent"
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Device"
                "Device"
                "Modification"
              ]
        }
        {
            name: "Scimitar Squadron Pilot"
            id: 208
            faction: "Galactic Empire"
            ship: "TIE Bomber"
            skill: 2
            points: 27
            slots: [
                "Torpedo"
                "Missile"
                "Missile"
                "Gunner"
                "Device"
                "Device"
                "Modification"
              ]
        }
        {
            name: '"Countdown"'
            id: 209
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Striker"
            skill: 4
            points: 43
            slots: [
                "Talent"
                "Gunner"
                "Device"
                "Modification"
              ]
        }
        {
            name: '"Pure Sabacc"'
            id: 210
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Striker"
            skill: 4
            points: 43
            slots: [
                "Talent"
                "Gunner"
                "Device"
                "Modification"
              ]
        }
        {
            name: '"Duchess"'
            id: 211
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Striker"
            skill: 5
            points: 44
            slots: [
                "Talent"
                "Gunner"
                "Device"
                "Modification"
              ]
        }
        {
            name: "Black Squadron Scout"
            id: 212
            faction: "Galactic Empire"
            ship: "TIE Striker"
            skill: 3
            points: 33
            slots: [
                "Talent"
                "Gunner"
                "Device"
                "Modification"
              ]
        }
        {
            name: "Planetary Sentinel"
            id: 213
            faction: "Galactic Empire"
            ship: "TIE Striker"
            skill: 1
            points: 31
            slots: [
                "Gunner"
                "Device"
                "Modification"
              ]
        }
        {
            name: "Rear Admiral Chiraneau"
            id: 214
            unique: true
            faction: "Galactic Empire"
            ship: "VT-49 Decimator"
            skill: 5
            points: 76
            slots: [
                "Talent"
                "Torpedo"
                "Crew"
                "Crew"
                "Crew"
                "Gunner"
                "Device"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Captain Oicunn"
            id: 215
            unique: true
            faction: "Galactic Empire"
            ship: "VT-49 Decimator"
            skill: 3
            points: 74
            slots: [
                "Talent"
                "Torpedo"
                "Crew"
                "Crew"
                "Crew"
                "Gunner"
                "Device"
                "Modification"
                "Title"
              ]
        }
        {
            name: "Patrol Leader"
            id: 216
            faction: "Galactic Empire"
            ship: "VT-49 Decimator"
            skill: 2
            points: 67
            slots: [
                "Torpedo"
                "Crew"
                "Crew"
                "Crew"
                "Gunner"
                "Device"
                "Modification"
                "Title"
              ]
        }
        {
            name: '"Howlrunner"'
            id: 217
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 5
            points: 46
            slots: [
                "Talent"
                "Modification"
              ]
        }
        {
            name: "Iden Versio"
            id: 218
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 4
            charge: 1
            points: 41
            slots: [
                "Talent"
                "Modification"
              ]
        }
        {
            name: '"Mauler" Mithel'
            id: 219
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 5
            points: 31
            slots: [
                "Talent"
                "Modification"
              ]
        }
        {
            name: '"Scourge" Skutu'
            id: 220
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 5
            points: 31
            slots: [
                "Talent"
                "Modification"
              ]
        }
        {
            name: '"Wampa"'
            id: 221
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 1
            recurring: true
            charge: 1
            points: 29
            slots: [
                "Modification"
              ]
        }
        {
            name: "Del Meeko"
            id: 222
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 4
            points: 30
            slots: [
                "Talent"
                "Modification"
              ]
        }
        {
            name: "Gideon Hask"
            id: 223
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 4
            points: 30
            slots: [
                "Talent"
                "Modification"
              ]
        }
        {
            name: "Seyn Marana"
            id: 224
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 4
            points: 30
            slots: [
                "Talent"
                "Modification"
              ]
        }
        {
            name: "Valen Rudor"
            id: 225
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 3
            points: 27
            slots: [
                "Talent"
                "Modification"
              ]
        }
        {
            name: '"Night Beast"'
            id: 226
            unique: true
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 2
            points: 25
            slots: [
                "Modification"
              ]
        }
        {
            name: "Black Squadron Ace"
            id: 227
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 3
            points: 25
            slots: [
                "Talent"
                "Modification"
              ]
        }
        {
            name: "Obsidian Squadron Pilot"
            id: 228
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 2
            points: 23
            slots: [
                "Modification"
              ]
        }
        {
            name: "Academy Pilot"
            id: 229
            faction: "Galactic Empire"
            ship: "TIE Fighter"
            skill: 1
            points: 22
            slots: [
                "Modification"
              ]
        }
        {
            name: "Spice Runner"
            id: 230
            faction: "Scum and Villainy"
            ship: "HWK-290"
            skill: 1
            points: 28
            slots: [
                "Crew"
                "Device"
                "Illicit"
                "Modification"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Poe Dameron"
            id: 231
            unique: true
            faction: "Resistance"
            ship: "T-70 X-Wing"
            skill: 6
            points: 67
            charge: 1
            recurring: true
            slots: [
                "Talent"
                "Astromech"
                "Modification"
                "Configuration"
                "Tech"
                "Title"
                "HardpointShip"
            ]
        }
        {
            id: 232 # duplicate, has been removed
            skip: true
        }
        {
            name: '"Midnight"'
            id: 233
            unique: true
            faction: "First Order"
            ship: "TIE/FO Fighter"
            skill: 6
            points: 42
            slots: [
                "Talent"
                "Tech"
                "Modification"
            ]
        }
        {
            name: '"Longshot"'
            id: 234
            skip: true
            unique: true
            faction: "First Order"
            ship: "TIE/FO Fighter"
            skill: 3
            points: 32
            slots: [
                "Talent"
                "Tech"
                "Modification"
            ]
        }
        {
            name: '"Muse"'
            id: 235
            unique: true
            faction: "First Order"
            ship: "TIE/FO Fighter"
            skill: 2
            points: 30
            slots: [
                "Talent"
                "Tech"
                "Modification"
            ]
        }
        {
            name: "Kylo Ren"
            id: 236
            unique: true
            faction: "First Order"
            ship: "TIE/VN Silencer"
            skill: 5
            force: 2
            darkside: true
            points: 76
            applies_condition: '''I'll Show You the Dark Side'''.canonicalize()
            slots: [
                "Force"
                "Tech"
                "Torpedo"
                "Missile"
            ]
        }
        {
            name: '"Blackout"'
            id: 237
            unique: true
            faction: "First Order"
            ship: "TIE/VN Silencer"
            skill: 5
            points: 63
            slots: [
                "Talent"
                "Tech"
                "Torpedo"
                "Missile"
            ]
        }
        {
            name: "Lieutenant Dormitz"
            id: 238
            unique: true
            faction: "First Order"
            ship: "Upsilon-Class Command Shuttle"
            skill: 2
            points: 70
            slots: [
                "Tech"
                "Tech"
                "Crew"
                "Crew"
                "Crew"
                "Cannon"
                "Sensor"
                "Modification"
            ]
        }
        {
            name: "L'ulo L'ampar"
            id: 239
            unique: true
            faction: "Resistance"
            ship: "RZ-2 A-Wing"
            skill: 5
            points: 43
            slots: [
                "Talent"
                "Talent"
                "Missile"
                "Tech"
            ]
        }
        {
            name: "Tallissan Lintra"
            id: 240
            unique: true
            faction: "Resistance"
            ship: "RZ-2 A-Wing"
            skill: 5
            charge: 1
            recurring: true
            points: 36
            slots: [
                "Talent"
                "Talent"
                "Missile"
                "Tech"
            ]
        }
        {
            name: "blanks"
            id: 241
            skip: true
        }
        {
            name: '"Backdraft"'
            id: 242
            unique: true
            faction: "First Order"
            ship: "TIE/SF Fighter"
            skill: 4
            points: 39
            slots: [
                "Talent"
                "Tech"
                "Missile"
                "Gunner"
                "Sensor"
                "Modification"
            ]
        }
        {
            name: '"Quickdraw"'
            id: 243
            unique: true
            faction: "First Order"
            ship: "TIE/SF Fighter"
            skill: 6
            charge: 1
            recurring: true
            points: 47
            slots: [
                "Talent"
                "Tech"
                "Missile"
                "Gunner"
                "Sensor"
                "Modification"
            ]
        }
        {
            name: "Rey"
            id: 244
            unique: true
            faction: "Resistance"
            ship: "Scavenged YT-1300"
            skill: 5
            points: 68
            force: 2
            slots: [
                "Force"
                "Missile"
                "Crew"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Han Solo (Resistance)"
            id: 245
            unique: true
            xws: "hansolo-scavengedyt1300"
            faction: "Resistance"
            ship: "Scavenged YT-1300"
            skill: 6
            points: 63
            slots: [
                "Talent"
                "Missile"
                "Crew"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Chewbacca (Resistance)"
            id: 246
            unique: true
            faction: "Resistance"
            xws: "chewbacca-scavengedyt1300"
            ship: "Scavenged YT-1300"
            skill: 4
            points: 61
            slots: [
                "Talent"
                "Missile"
                "Crew"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Captain Seevor"
            id: 247
            unique: true
            faction: "Scum and Villainy"
            ship: "Mining Guild TIE Fighter"
            skill: 3
            charge: 1
            recurring: true
            points: 30
            slots: [
                "Talent"
                "Modification"
            ]
        }
        {
            name: "Mining Guild Surveyor"
            id: 248
            faction: "Scum and Villainy"
            ship: "Mining Guild TIE Fighter"
            skill: 2
            points: 23
            slots: [
                "Talent"
                "Modification"
            ]
        }
        {
            name: "Ahhav"
            id: 249
            unique: true
            faction: "Scum and Villainy"
            ship: "Mining Guild TIE Fighter"
            skill: 3
            points: 30
            slots: [
                "Talent"
                "Modification"
            ]
        }
        {
            name: "Finch Dallow"
            id: 250
            unique: true
            faction: "Resistance"
            ship: "MG-100 StarFortress"
            skill: 4
            points: 58
            slots: [
                "Sensor"
                "Tech"
                "Crew"
                "Gunner"
                "Gunner"
                "Device"
                "Device"
                "Modification"
            ]
        }
        {
            name: "Major Stridan"
            id: 251
            unique: true
            faction: "First Order"
            ship: "Upsilon-Class Command Shuttle"
            skill: 4
            points: 61
            slots: [
                "Tech"
                "Tech"
                "Crew"
                "Crew"
                "Crew"
                "Cannon"
                "Sensor"
                "Modification"
            ]
        }
        {
            name: "Kare Kun"
            id: 252
            unique: true
            faction: "Resistance"
            ship: "T-70 X-Wing"
            skill: 4
            points: 51
            slots: [
                "Talent"
                "Astromech"
                "Modification"
                "Configuration"
                "Tech"
                "Title"
                "HardpointShip"
            ]
        }
        {
            name: "Joph Seastriker"
            id: 253
            unique: true
            faction: "Resistance"
            ship: "T-70 X-Wing"
            skill: 3
            points: 49
            slots: [
                "Talent"
                "Astromech"
                "Modification"
                "Configuration"
                "Tech"
                "Title"
                "HardpointShip"
            ]
        }
        {
            name: "Lieutenant Bastian"
            id: 254
            unique: true
            faction: "Resistance"
            ship: "T-70 X-Wing"
            skill: 2
            points: 47
            slots: [
                "Astromech"
                "Modification"
                "Configuration"
                "Tech"
                "Title"
                "HardpointShip"
            ]
        }
        {
            name: "Jaycris Tubbs"
            id: 255
            unique: true
            faction: "Resistance"
            ship: "T-70 X-Wing"
            skill: 1
            points: 48
            slots: [
                "Astromech"
                "Modification"
                "Configuration"
                "Tech"
                "Title"
                "HardpointShip"
            ]
        }
        {
            name: "Black Squadron Ace (T-70)"
            id: 256
            faction: "Resistance"
            xws: "blacksquadronace-t70xwing"
            ship: "T-70 X-Wing"
            skill: 4
            points: 47
            slots: [
                "Talent"
                "Astromech"
                "Modification"
                "Configuration"
                "Tech"
                "Title"
                "HardpointShip"
            ]
        }
        {
            name: "Red Squadron Expert"
            id: 257
            faction: "Resistance"
            ship: "T-70 X-Wing"
            skill: 3
            points: 44
            slots: [
                "Talent"
                "Astromech"
                "Modification"
                "Configuration"
                "Tech"
                "Title"
                "HardpointShip"
            ]
        }
        {
            name: "Blue Squadron Rookie"
            id: 258
            faction: "Resistance"
            ship: "T-70 X-Wing"
            skill: 1
            points: 42
            slots: [
                "Astromech"
                "Modification"
                "Configuration"
                "Tech"
                "Title"
                "HardpointShip"
            ]
        }
        {
            name: "Zeta Squadron Survivor"
            id: 259
            faction: "First Order"
            ship: "TIE/SF Fighter"
            skill: 2
            points: 32
            slots: [
                "Tech"
                "Missile"
                "Gunner"
                "Sensor"
                "Modification"
            ]
        }
        {
            name: "Cobalt Squadron Bomber"
            id: 260
            faction: "Resistance"
            ship: "MG-100 StarFortress"
            skill: 1
            points: 51
            slots: [
                "Sensor"
                "Tech"
                "Crew"
                "Gunner"
                "Gunner"
                "Device"
                "Device"
                "Modification"
            ]
        }
        {
            name: "TN-3465"
            id: 261
            unique: true
            faction: "First Order"
            ship: "TIE/FO Fighter"
            skill: 2
            points: 28
            slots: [
                "Tech"
                "Modification"
            ]
        }
        {
            name: '"Scorch"'
            id: 262
            unique: true
            faction: "First Order"
            ship: "TIE/FO Fighter"
            skill: 4
            points: 33
            slots: [
                "Talent"
                "Tech"
                "Modification"
            ]
        }
        {
            name: '"Longshot"'
            id: 263
            unique: true
            faction: "First Order"
            ship: "TIE/FO Fighter"
            skill: 3
            points: 31
            slots: [
                "Talent"
                "Tech"
                "Modification"
            ]
        }
        {
            name: '"Static"'
            id: 264
            unique: true
            faction: "First Order"
            ship: "TIE/FO Fighter"
            skill: 4
            points: 33
            slots: [
                "Talent"
                "Tech"
                "Modification"
            ]
        }
        {
            name: "Lieutenant Rivas"
            id: 265
            unique: true
            faction: "First Order"
            ship: "TIE/FO Fighter"
            skill: 1
            points: 27
            slots: [
                "Tech"
                "Modification"
            ]
        }
        {
            name: "Commander Malarus"
            id: 266
            unique: true
            faction: "First Order"
            ship: "TIE/FO Fighter"
            skill: 5
            points: 38
            charge: 2
            slots: [
                "Talent"
                "Tech"
                "Modification"
            ]
        }
        {
            name: "Omega Squadron Ace"
            id: 267
            faction: "First Order"
            ship: "TIE/FO Fighter"
            skill: 3
            points: 28
            slots: [
                "Talent"
                "Tech"
                "Modification"
            ]
        }
        {
            name: "Zeta Squadron Pilot"
            id: 268
            faction: "First Order"
            ship: "TIE/FO Fighter"
            skill: 2
            points: 26
            slots: [
                "Tech"
                "Modification"
            ]
        }
        {
            name: "Epsilon Squadron Cadet"
            id: 269
            faction: "First Order"
            ship: "TIE/FO Fighter"
            skill: 1
            points: 25
            slots: [
                "Tech"
                "Modification"
            ]
        }
        {
            name: "Greer Sonnel"
            id: 270
            unique: true
            faction: "Resistance"
            ship: "RZ-2 A-Wing"
            skill: 4
            points: 36
            slots: [
                "Talent"
                "Talent"
                "Missile"
                "Tech"
            ]
        }
        {
            name: "Zari Bangel"
            id: 271
            unique: true
            faction: "Resistance"
            ship: "RZ-2 A-Wing"
            skill: 3
            points: 35
            slots: [
                "Talent"
                "Talent"
                "Missile"
                "Tech"
            ]
        }
        {
            name: "Darth Maul"
            id: 272
            unique: true
            faction: "Separatist Alliance"
            ship: "Sith Infiltrator"
            skill: 5
            force: 3
            darkside: true
            points: 65
            slots: [
                "Force"
                "Cannon"
                "Torpedo"
                "Crew"
                "Crew"
                "Device"
                "Modification"
                "Title"
                "Tactical Relay"
            ]
        }
        {
            name: "Anakin Skywalker"
            id: 273
            unique: true
            faction: "Galactic Republic"
            ship: "Delta-7 Aethersprite"
            skill: 6
            force: 3
            points: 62
            slots: [
                "Force"
                "Astromech"
                "Configuration"
                "Modification"
            ]
        }
        {
            name: "Luminara Unduli"
            id: 274
            unique: true
            faction: "Galactic Republic"
            ship: "Delta-7 Aethersprite"
            skill: 4
            force: 2
            points: 43
            slots: [
                "Force"
                "Astromech"
                "Configuration"
                "Modification"
            ]
        }
        {
            name: "Barriss Offee"
            id: 275
            unique: true
            faction: "Galactic Republic"
            ship: "Delta-7 Aethersprite"
            skill: 4
            force: 1
            points: 38
            slots: [
                "Force"
                "Astromech"
                "Configuration"
                "Modification"
            ]
        }
        {
            name: "Ahsoka Tano"
            id: 276
            unique: true
            faction: "Galactic Republic"
            ship: "Delta-7 Aethersprite"
            skill: 3
            force: 2
            points: 44
            slots: [
                "Force"
                "Astromech"
                "Configuration"
                "Modification"
            ]
        }
        {
            name: "Jedi Knight"
            id: 277
            faction: "Galactic Republic"
            ship: "Delta-7 Aethersprite"
            skill: 3
            force: 1
            points: 37
            slots: [
                "Force"
                "Astromech"
                "Configuration"
                "Modification"
            ]
        }
        {
            name: "Obi-Wan Kenobi"
            id: 278
            unique: true
            faction: "Galactic Republic"
            ship: "Delta-7 Aethersprite"
            skill: 5
            force: 3
            points: 49
            slots: [
                "Force"
                "Astromech"
                "Configuration"
                "Modification"
            ]
        }
        {
            name: "Trade Federation Drone"
            id: 279
            faction: "Separatist Alliance"
            ship: "Vulture-class Droid Fighter"
            skill: 1
            points: 20
            slots: [
                "Missile"
                "Configuration"
                "Modification"
            ]
        }
        {
            name: '"Sinker"'
            id: 280
            unique: true
            faction: "Galactic Republic"
            ship: "ARC-170"
            skill: 3
            points: 54
            slots: [
                "Torpedo"
                "Crew"
                "Gunner"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Petty Officer Thanisson"
            id: 281
            unique: true
            faction: "First Order"
            ship: "Upsilon-Class Command Shuttle"
            skill: 1
            points: 59
            charge: 1
            recurring: true
            slots: [
                "Tech"
                "Tech"
                "Crew"
                "Crew"
                "Crew"
                "Cannon"
                "Sensor"
                "Modification"
            ]
        }
        {
            name: "Captain Cardinal"
            id: 282
            unique: true
            faction: "First Order"
            ship: "Upsilon-Class Command Shuttle"
            skill: 4
            points: 62
            charge: 2
            slots: [
                "Tech"
                "Tech"
                "Crew"
                "Crew"
                "Crew"
                "Cannon"
                "Sensor"
                "Modification"
            ]
        }
        {
            name: '"Avenger"'
            id: 283
            unique: true
            faction: "First Order"
            ship: "TIE/VN Silencer"
            skill: 3
            points: 56
            slots: [
                "Talent"
                "Tech"
                "Torpedo"
                "Missile"
            ]
        }
        {
            name: '"Recoil"'
            id: 284
            unique: true
            faction: "First Order"
            ship: "TIE/VN Silencer"
            skill: 4
            points: 57
            slots: [
                "Talent"
                "Tech"
                "Torpedo"
                "Missile"
            ]
        }
        {
            name: "Omega Squadron Expert"
            id: 285
            faction: "First Order"
            ship: "TIE/SF Fighter"
            skill: 3
            points: 34
            slots: [
                "Talent"
                "Tech"
                "Missile"
                "Gunner"
                "Sensor"
                "Modification"
            ]
        }
        {
            name: "Sienar-Jaemus Engineer"
            id: 286
            faction: "First Order"
            ship: "TIE/VN Silencer"
            skill: 1
            points: 48
            slots: [
                "Tech"
                "Torpedo"
                "Missile"
            ]
        }
        {
            name: "First Order Test Pilot"
            id: 287
            faction: "First Order"
            ship: "TIE/VN Silencer"
            skill: 4
            points: 56
            slots: [
                "Talent"
                "Tech"
                "Torpedo"
                "Missile"
            ]
        }
        {
            name: "Starkiller Base Pilot"
            id: 288
            faction: "First Order"
            ship: "Upsilon-Class Command Shuttle"
            skill: 2
            points: 58
            slots: [
                "Tech"
                "Tech"
                "Crew"
                "Crew"
                "Crew"
                "Cannon"
                "Sensor"
                "Modification"
            ]
        }
        {
            name: "Lieutenant Tavson"
            id: 289
            unique: true
            faction: "First Order"
            ship: "Upsilon-Class Command Shuttle"
            skill: 3
            charge: 2
            recurring: true
            points: 64
            slots: [
                "Tech"
                "Tech"
                "Crew"
                "Crew"
                "Crew"
                "Cannon"
                "Sensor"
                "Modification"
            ]
        }
        {
            name: '"Null"'
            id: 290
            unique: true
            faction: "First Order"
            ship: "TIE/FO Fighter"
            skill: 0
            points: 30
            slots: [
                "Tech"
                "Modification"
            ]
        }
        {
            name: "Cat"
            id: 291
            unique: true
            faction: "Resistance"
            ship: "MG-100 StarFortress"
            skill: 1
            points: 52
            slots: [
                "Sensor"
                "Tech"
                "Crew"
                "Gunner"
                "Gunner"
                "Device"
                "Device"
                "Modification"
            ]
        }
        {
            name: "Ben Teene"
            id: 292
            unique: true
            faction: "Resistance"
            ship: "MG-100 StarFortress"
            skill: 3
            points: 56
            slots: [
                "Sensor"
                "Tech"
                "Crew"
                "Gunner"
                "Gunner"
                "Device"
                "Device"
                "Modification"
            ]
            applies_condition: 'Rattled'.canonicalize()
        }
        {
            name: "Edon Kappehl"
            id: 293
            unique: true
            faction: "Resistance"
            ship: "MG-100 StarFortress"
            skill: 3
            points: 58
            slots: [
                "Sensor"
                "Tech"
                "Crew"
                "Gunner"
                "Gunner"
                "Device"
                "Device"
                "Modification"
            ]
        }
        {
            name: "Vennie"
            id: 294
            unique: true
            faction: "Resistance"
            ship: "MG-100 StarFortress"
            skill: 2
            points: 54
            slots: [
                "Sensor"
                "Tech"
                "Crew"
                "Gunner"
                "Gunner"
                "Device"
                "Device"
                "Modification"
            ]
        }
        {
            name: "Resistance Sympathizer"
            id: 295
            faction: "Resistance"
            ship: "Scavenged YT-1300"
            skill: 2
            points: 59
            slots: [
                "Missile"
                "Crew"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Jessika Pava"
            id: 296
            unique: true
            faction: "Resistance"
            ship: "T-70 X-Wing"
            skill: 3
            points: 51
            charge: 1
            recurring: true
            slots: [
                "Astromech"
                "Modification"
                "Configuration"
                "Tech"
                "Title"
                "HardpointShip"
            ]
        }
        {
            name: "Temmin Wexley"
            id: 297
            unique: true
            faction: "Resistance"
            ship: "T-70 X-Wing"
            skill: 4
            points: 53
            slots: [
                "Talent"
                "Astromech"
                "Modification"
                "Configuration"
                "Tech"
                "Title"
                "HardpointShip"
            ]
        }
        {
            name: "Nien Nunb"
            id: 298
            unique: true
            faction: "Resistance"
            ship: "T-70 X-Wing"
            skill: 5
            points: 55
            slots: [
                "Talent"
                "Astromech"
                "Modification"
                "Configuration"
                "Tech"
                "Title"
                "HardpointShip"
            ]
        }
        {
            name: "Ello Asty"
            id: 299
            unique: true
            faction: "Resistance"
            ship: "T-70 X-Wing"
            skill: 5
            points: 55
            slots: [
                "Talent"
                "Astromech"
                "Modification"
                "Configuration"
                "Tech"
                "Title"
                "HardpointShip"
            ]
        }
        {
            name: "Green Squadron Expert"
            id: 300
            faction: "Resistance"
            ship: "RZ-2 A-Wing"
            skill: 3
            points: 34
            slots: [
                "Talent"
                "Talent"
                "Missile"
                "Tech"
            ]
        }
        {
            name: "Blue Squadron Recruit"
            id: 301
            faction: "Resistance"
            ship: "RZ-2 A-Wing"
            skill: 1
            points: 32
            slots: [
                "Talent"
                "Missile"
                "Tech"
            ]
        }
        {
            name: "Foreman Proach"
            id: 302
            unique: true
            faction: "Scum and Villainy"
            ship: "Mining Guild TIE Fighter"
            skill: 4
            points: 32
            slots: [
                "Talent"
                "Modification"
            ]
        }
        {
            name: "Overseer Yushyn"
            id: 303
            unique: true
            faction: "Scum and Villainy"
            ship: "Mining Guild TIE Fighter"
            skill: 2
            charge: 1
            recurring: true
            points: 26
            slots: [
                "Modification"
            ]
        }
        {
            name: "Mining Guild Sentry"
            id: 304
            faction: "Scum and Villainy"
            ship: "Mining Guild TIE Fighter"
            skill: 1
            points: 22
            slots: [
                "Modification"
            ]
        }
        {
            name: "General Grievous"
            id: 305
            faction: "Separatist Alliance"
            ship: "Belbullab-22 Starfighter"
            unique: true
            skill: 4
            points: 44
            slots: [
                "Talent"
                "Tactical Relay"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Wat Tambor"
            id: 306
            faction: "Separatist Alliance"
            ship: "Belbullab-22 Starfighter"
            unique: true
            skill: 3
            points: 42
            slots: [
                "Talent"
                "Tactical Relay"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Feethan Ottraw Autopilot"
            id: 307
            faction: "Separatist Alliance"
            ship: "Belbullab-22 Starfighter"
            skill: 1
            points: 35
            slots: [
                "Tactical Relay"
                "Modification"
                "Title"
            ]
            ship_override:
                actions: [
                    "Calculate"
                    "Lock"
                    "Barrel Roll"
                    "R> Calculate"
                    "Boost"
                    "R> Calculate"
                ]
        }
        {
            name: "Captain Sear"
            id: 308
            faction: "Separatist Alliance"
            ship: "Belbullab-22 Starfighter"
            unique: true
            skill: 2
            points: 45
            slots: [
                "Tactical Relay"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Precise Hunter"
            id: 309
            faction: "Separatist Alliance"
            ship: "Vulture-class Droid Fighter"
            skill: 3
            points: 23
            max_per_squad: 3
            slots: [
                "Missile"
                "Configuration"
                "Modification"
            ]
        }
        {
            name: "Haor Chall Prototype"
            id: 310
            faction: "Separatist Alliance"
            ship: "Vulture-class Droid Fighter"
            skill: 1
            points: 21
            max_per_squad: 2
            slots: [
                "Missile"
                "Configuration"
                "Modification"
            ]
        }
        {
            name: "DFS-081"
            id: 311
            faction: "Separatist Alliance"
            ship: "Vulture-class Droid Fighter"
            skill: 3
            points: 26
            unique: true
            slots: [
                "Missile"
                "Configuration"
                "Modification"
            ]
        }
        {
            name: "Plo Koon"
            id: 312
            unique: true
            faction: "Galactic Republic"
            ship: "Delta-7 Aethersprite"
            skill: 5
            force: 2
            points: 45
            slots: [
                "Force"
                "Astromech"
                "Configuration"
                "Modification"
            ]
        }
        {
            name: "Saesee Tiin"
            id: 313
            unique: true
            faction: "Galactic Republic"
            ship: "Delta-7 Aethersprite"
            skill: 4
            force: 2
            points: 43
            slots: [
                "Force"
                "Astromech"
                "Configuration"
                "Modification"
            ]
        }
        {
            name: "Mace Windu"
            id: 314
            unique: true
            faction: "Galactic Republic"
            ship: "Delta-7 Aethersprite"
            skill: 4
            force: 3
            points: 46
            slots: [
                "Force"
                "Astromech"
                "Configuration"
                "Modification"
            ]
        }
        {
            name: '"Kickback"'
            id: 315
            unique: true
            faction: "Galactic Republic"
            ship: "V-19 Torrent"
            skill: 4
            points: 30
            slots: [
                "Talent"
                "Missile"
                "Modification"
            ]
        }
        {
            name: '"Odd Ball"'
            id: 316
            unique: true
            faction: "Galactic Republic"
            ship: "V-19 Torrent"
            skill: 5
            points: 31
            slots: [
                "Talent"
                "Missile"
                "Modification"
            ]
        }
        {
            name: '"Swoop"'
            id: 317
            unique: true
            faction: "Galactic Republic"
            ship: "V-19 Torrent"
            skill: 3
            points: 28
            slots: [
                "Talent"
                "Missile"
                "Modification"
            ]
        }
        {
            name: '"Axe"'
            id: 318
            unique: true
            faction: "Galactic Republic"
            ship: "V-19 Torrent"
            skill: 3
            points: 29
            slots: [
                "Talent"
                "Missile"
                "Modification"
            ]
        }
        {
            name: '"Tucker"'
            id: 319
            unique: true
            faction: "Galactic Republic"
            ship: "V-19 Torrent"
            skill: 2
            points: 27
            slots: [
                "Missile"
                "Modification"
            ]
        }
        {
            name: "Blue Squadron Protector"
            id: 320
            faction: "Galactic Republic"
            ship: "V-19 Torrent"
            skill: 3
            points: 26
            slots: [
                "Talent"
                "Missile"
                "Modification"
            ]
        }
        {
            name: "Gold Squadron Trooper"
            id: 321
            faction: "Galactic Republic"
            ship: "V-19 Torrent"
            skill: 2
            points: 25
            slots: [
                "Missile"
                "Modification"
            ]
        }
        {
            name: "Anakin Skywalker (N-1 Starfighter)"
            canonical_name: 'Anakin Skywalker'.canonicalize()
            xws: "anakinskywalker-nabooroyaln1starfighter"
            id: 322
            unique: true
            faction: "Galactic Republic"
            ship: "Naboo Royal N-1 Starfighter"
            skill: 4
            force: 1
            points: 41
            slots: [
                "Talent"
                "Sensor"
                "Astromech"
                "Torpedo"
            ]
        }
        {
            name: "Bravo Flight Officer"
            id: 323
            faction: "Galactic Republic"
            ship: "Naboo Royal N-1 Starfighter"
            skill: 2
            points: 33
            slots: [
                "Sensor"
                "Astromech"
                "Torpedo"
            ]
        }
        {
            name: "Techno Union Bomber"
            id: 324
            faction: "Separatist Alliance"
            ship: "Hyena-Class Droid Bomber"
            skill: 1
            points: 25
            slots: [
                "Torpedo"
                "Missile"
                "Device"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Bombardment Drone"
            id: 325
            faction: "Separatist Alliance"
            ship: "Hyena-Class Droid Bomber"
            skill: 3
            max_per_squad: 3
            points: 29
            slots: [
                "Sensor"
                "Device"
                "Device"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "DBS-404"
            id: 326
            unique: true
            faction: "Separatist Alliance"
            ship: "Hyena-Class Droid Bomber"
            skill: 4
            points: 30
            slots: [
                "Torpedo"
                "Missile"
                "Device"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Separatist Bomber"
            id: 327
            faction: "Separatist Alliance"
            ship: "Hyena-Class Droid Bomber"
            skill: 3
            points: 28
            slots: [
                "Torpedo"
                "Missile"
                "Device"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "DBS-32C"
            id: 328
            unique: true
            faction: "Separatist Alliance"
            ship: "Hyena-Class Droid Bomber"
            skill: 3
            points: 40
            slots: [
                "Sensor"
                "Tactical Relay"
                "Modification"
                "Configuration"
            ]
            ship_override:
                actionsred: [
                    "Jam"
                ]
        }
        {
            name: "Baktoid Prototype"
            id: 329
            max_per_squad: 2
            faction: "Separatist Alliance"
            ship: "Hyena-Class Droid Bomber"
            skill: 1
            points: 28
            slots: [
                "Sensor"
                "Missile"
                "Missile"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Naboo Handmaiden"
            id: 330
            max_per_squad: 2
            faction: "Galactic Republic"
            ship: "Naboo Royal N-1 Starfighter"
            skill: 1
            points: 42
            applies_condition: '''Decoyed'''.canonicalize()
            slots: [
                "Sensor"
                "Astromech"
                "Torpedo"
            ]
        }
        {
            name: "Dineé Ellberger"
            id: 331
            xws: "dineeellberger"
            unique: true
            faction: "Galactic Republic"
            ship: "Naboo Royal N-1 Starfighter"
            skill: 3
            points: 38
            slots: [
                "Talent"
                "Sensor"
                "Astromech"
                "Torpedo"
            ]
        }
        {
            name: "Padmé Amidala"
            id: 332
            xws: "padmeamidala"
            unique: true
            faction: "Galactic Republic"
            ship: "Naboo Royal N-1 Starfighter"
            skill: 4
            points: 45
            slots: [
                "Talent"
                "Sensor"
                "Astromech"
                "Torpedo"
            ]
        }
        {
            name: "Ric Olié"
            id: 333
            xws: "ricolie"
            unique: true
            faction: "Galactic Republic"
            ship: "Naboo Royal N-1 Starfighter"
            skill: 5
            points: 45
            slots: [
                "Talent"
                "Sensor"
                "Astromech"
                "Torpedo"
            ]
        }
        {
            name: "Count Dooku"
            id: 334
            unique: true
            faction: "Separatist Alliance"
            ship: "Sith Infiltrator"
            skill: 3
            force: 3
            darkside: true
            points: 63
            slots: [
                "Force"
                "Cannon"
                "Torpedo"
                "Crew"
                "Crew"
                "Device"
                "Modification"
                "Title"
                "Tactical Relay"
            ]
        }
        {
            name: "0-66"
            id: 335
            unique: true
            faction: "Separatist Alliance"
            ship: "Sith Infiltrator"
            skill: 3
            points: 49
            slots: [
                "Talent"
                "Cannon"
                "Torpedo"
                "Crew"
                "Crew"
                "Device"
                "Modification"
                "Title"
                "Tactical Relay"
            ]
            ship_override:
                actions: [
                    "Calculate"
                    "Lock"
                ]
        }
        {
            name: "Dark Courier"
            id: 336
            faction: "Separatist Alliance"
            ship: "Sith Infiltrator"
            skill: 2
            points: 51
            slots: [
                "Cannon"
                "Torpedo"
                "Crew"
                "Crew"
                "Device"
                "Modification"
                "Title"
                "Tactical Relay"
            ]
        }
        {
            name: "DFS-311"
            id: 337
            faction: "Separatist Alliance"
            ship: "Vulture-class Droid Fighter"
            skill: 1
            points: 23
            unique: true
            slots: [
                "Missile"
                "Configuration"
                "Modification"
            ]
        }
        {
            name: '"Odd Ball" (ARC-170)'
            id: 338
            xws: "oddball-arc170starfighter"
            canonical_name: '"Odd Ball"'.canonicalize()
            unique: true
            faction: "Galactic Republic"
            ship: "ARC-170"
            skill: 5
            points: 49
            slots: [
                "Talent"
                "Torpedo"
                "Crew"
                "Gunner"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: '"Jag"'
            id: 339
            unique: true
            faction: "Galactic Republic"
            ship: "ARC-170"
            skill: 3
            points: 48
            slots: [
                "Torpedo"
                "Crew"
                "Gunner"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Squad Seven Veteran"
            id: 340
            faction: "Galactic Republic"
            ship: "ARC-170"
            skill: 3
            points: 44
            slots: [
                "Talent"
                "Torpedo"
                "Crew"
                "Gunner"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "104th Battalion Pilot"
            id: 341
            faction: "Galactic Republic"
            ship: "ARC-170"
            skill: 2
            points: 42
            slots: [
                "Torpedo"
                "Crew"
                "Gunner"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: '"Wolffe"'
            id: 342
            unique: true
            faction: "Galactic Republic"
            ship: "ARC-170"
            skill: 4
            charge: 1
            points: 50
            slots: [
                "Talent"
                "Torpedo"
                "Crew"
                "Gunner"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Separatist Drone"
            id: 343
            faction: "Separatist Alliance"
            ship: "Vulture-class Droid Fighter"
            skill: 3
            points: 22
            slots: [
                "Missile"
                "Configuration"
                "Modification"
            ]
        }
        {
            name: "Skakoan Ace"
            id: 344
            faction: "Separatist Alliance"
            ship: "Belbullab-22 Starfighter"
            skill: 3
            points: 38
            slots: [
                "Talent"
                "Tactical Relay"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Rose Tico"
            id: 345
            unique: true
            faction: "Resistance"
            ship: "Resistance Transport Pod"
            skill: 3
            points: 26
            slots: [
                "Talent"
                "Tech"
                "Crew"
                "Modification"
            ]
        }
        {
            name: "Logistics Division Pilot"
            id: 346
            faction: "Resistance"
            ship: "Resistance Transport"
            skill: 1
            points: 32
            slots: [
                "Tech"
                "Cannon"
                "Torpedo"
                "Crew"
                "Crew"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Pammich Nerro Goode"
            id: 347
            unique: true
            faction: "Resistance"
            ship: "Resistance Transport"
            skill: 3
            points: 36
            slots: [
                "Tech"
                "Cannon"
                "Torpedo"
                "Crew"
                "Crew"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Vi Moradi"
            id: 348
            unique: true
            faction: "Resistance"
            ship: "Resistance Transport Pod"
            skill: 1
            points: 27
            applies_condition: '''Compromising Intel'''.canonicalize()
            slots: [
                "Tech"
                "Crew"
                "Modification"
            ]
        }
        {
            name: "BB-8"
            id: 349
            unique: true
            faction: "Resistance"
            ship: "Resistance Transport Pod"
            skill: 3
            points: 26
            slots: [
                "Talent"
                "Tech"
                "Crew"
                "Modification"
            ]
            ship_override:
                actions: [
                    "Calculate"
                ]
        }
        {
            name: "Finn"
            id: 350
            unique: true
            faction: "Resistance"
            ship: "Resistance Transport Pod"
            skill: 2
            points: 29
            slots: [
                "Talent"
                "Tech"
                "Crew"
                "Modification"
            ]
        }
        {
            name: "Cova Nell"
            id: 351
            unique: true
            faction: "Resistance"
            ship: "Resistance Transport"
            skill: 4
            points: 38
            slots: [
                "Talent"
                "Tech"
                "Cannon"
                "Torpedo"
                "Crew"
                "Crew"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Nodin Chavdri"
            id: 352
            unique: true
            faction: "Resistance"
            ship: "Resistance Transport"
            skill: 2
            points: 36
            slots: [
                "Tech"
                "Cannon"
                "Torpedo"
                "Crew"
                "Crew"
                "Astromech"
                "Modification"
            ]
        }
        {
            name: "Stalgasin Hive Guard"
            id: 353
            faction: "Separatist Alliance"
            ship: "Nantex-Class Starfighter"
            skill: 3
            points: 29
            slots: [
                "Talent"
            ]
        }
        {
            name: "Petranaki Arena Ace"
            id: 354
            faction: "Separatist Alliance"
            ship: "Nantex-Class Starfighter"
            skill: 4
            points: 30
            slots: [
                "Talent"
                "Talent"
            ]
        }
        {
            name: "Gorgol"
            unique: true
            id: 355
            faction: "Separatist Alliance"
            ship: "Nantex-Class Starfighter"
            skill: 2
            points: 28
            slots: [
                "Talent"
                "Modification"
            ]
        }
        {
            name: "Chertek"
            unique: true
            id: 356
            faction: "Separatist Alliance"
            ship: "Nantex-Class Starfighter"
            skill: 4
            points: 34
            slots: [
                "Talent"
                "Talent"
            ]
        }
        {
            name: "Sun Fac"
            unique: true
            id: 357
            faction: "Separatist Alliance"
            ship: "Nantex-Class Starfighter"
            skill: 6
            points: 45
            slots: [
                "Talent"
                "Talent"
            ]
        }
        {
            name: "Berwer Kret"
            unique: true
            id: 358
            faction: "Separatist Alliance"
            ship: "Nantex-Class Starfighter"
            skill: 5
            points: 36
            slots: [
                "Talent"
                "Talent"
            ]
        }
        {
            name: "Anakin Skywalker (Y-Wing)"
            canonical_name: 'Anakin Skywalker'.canonicalize()
            xws: "anakinskywalker-btlbywing"
            unique: true
            id: 359
            faction: "Galactic Republic"
            ship: "BTL-B Y-Wing"
            skill: 6
            force: 3
            points: 55
            slots: [
                "Force"
                "Turret"
                "Torpedo"
                "Gunner"
                "Astromech"
                "Device"
                "Modification"
            ]
        }
        {
            name: "Shadow Squadron Veteran"
            id: 360
            faction: "Galactic Republic"
            ship: "BTL-B Y-Wing"
            skill: 3
            points: 31
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Gunner"
                "Astromech"
                "Device"
                "Modification"
            ]
        }
        {
            name: "Red Squadron Bomber"
            id: 361
            faction: "Galactic Republic"
            ship: "BTL-B Y-Wing"
            skill: 2
            points: 29
            slots: [
                "Turret"
                "Torpedo"
                "Gunner"
                "Astromech"
                "Device"
                "Modification"
            ]
        }
        {
            name: "R2-D2"
            id: 362
            unique: true
            faction: "Galactic Republic"
            ship: "BTL-B Y-Wing"
            skill: 2
            points: 32
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Gunner"
                "Crew"
                "Device"
                "Modification"
            ]
            ship_override:
                actions: [
                    "Calculate"
                    "Lock"
                ]
        }
        {
            name: '"Goji"'
            id: 363
            unique: true
            faction: "Galactic Republic"
            ship: "BTL-B Y-Wing"
            skill: 2
            points: 29
            slots: [
                "Turret"
                "Torpedo"
                "Gunner"
                "Astromech"
                "Device"
                "Modification"
            ]
        }
        {
            name: '"Broadside"'
            id: 364
            unique: true
            faction: "Galactic Republic"
            ship: "BTL-B Y-Wing"
            skill: 3
            points: 36
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Gunner"
                "Astromech"
                "Device"
                "Modification"
            ]
        }
        {
            name: '"Matchstick"'
            id: 365
            unique: true
            faction: "Galactic Republic"
            ship: "BTL-B Y-Wing"
            skill: 4
            points: 43
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Gunner"
                "Astromech"
                "Device"
                "Modification"
            ]
        }
        {
            name: '"Odd Ball" (Y-Wing)'
            xws: "oddball-btlbywing"
            id: 366
            unique: true
            canonical_name: '"Odd Ball"'.canonicalize()
            faction: "Galactic Republic"
            ship: "BTL-B Y-Wing"
            skill: 5
            points: 42
            slots: [
                "Talent"
                "Turret"
                "Torpedo"
                "Gunner"
                "Astromech"
                "Device"
                "Modification"
            ]
        }
        {
            name: "Republic Judiciary"
            id: 367
            faction: "Galactic Republic"
            ship: "CR90 Corellian Corvette"
            skill: 8
            engagement: 0
            points: 146
            slots: [
                "Command"
                "Hardpoint"
                "Hardpoint"
                "Crew"
                "Crew"
                "Gunner"
                "Team"
                "Team"
                "Cargo"
            ]
        }
        {
            name: "Alderaanian Guard"
            id: 368
            faction: "Rebel Alliance"
            ship: "CR90 Corellian Corvette"
            skill: 8
            engagement: 0
            points: 146
            slots: [
                "Command"
                "Hardpoint"
                "Hardpoint"
                "Crew"
                "Crew"
                "Gunner"
                "Team"
                "Team"
                "Cargo"
                "Title"
            ]
        }
        {
            name: "Outer Rim Patrol"
            id: 369
            faction: "Galactic Empire"
            ship: "Raider-class Corvette"
            skill: 8
            engagement: 0
            points: 146
            slots: [
                "Command"
                "Torpedo"
                "Missile"
                "Hardpoint"
                "Hardpoint"
                "Crew"
                "Team"
                "Team"
                "Cargo"
                "Title"
            ]
        }
        {
            name: "First Order Collaborators"
            id: 370
            faction: "First Order"
            ship: "Raider-class Corvette"
            skill: 8
            engagement: 0
            points: 146
            slots: [
                "Command"
                "Torpedo"
                "Missile"
                "Hardpoint"
                "Hardpoint"
                "Crew"
                "Team"
                "Team"
                "Cargo"
            ]
        }
        {
            name: "Echo Base Evacuees"
            id: 371
            faction: "Rebel Alliance"
            ship: "GR-75 Medium Transport"
            skill: 7
            engagement: 1
            points: 55
            slots: [
                "Command"
                "Hardpoint"
                "Turret"
                "Crew"
                "Crew"
                "Team"
                "Cargo"
                "Cargo"
                "Title"
            ]
        }
        {
            name: "New Republic Volunteers"
            id: 372
            faction: "Resistance"
            ship: "GR-75 Medium Transport"
            skill: 7
            engagement: 1
            points: 55
            slots: [
                "Command"
                "Hardpoint"
                "Turret"
                "Crew"
                "Crew"
                "Team"
                "Cargo"
                "Cargo"
            ]
        }
        {
            name: "Outer Rim Garrison"
            id: 373
            faction: "Galactic Empire"
            ship: "Gozanti-class Cruiser"
            skill: 7
            engagement: 1
            points: 60
            slots: [
                "Command"
                "Hardpoint"
                "Crew"
                "Crew"
                "Gunner"
                "Team"
                "Cargo"
                "Cargo"
                "Title"
            ]
        }
        {
            name: "First Order Sympathizers"
            id: 374
            faction: "First Order"
            ship: "Gozanti-class Cruiser"
            skill: 7
            engagement: 1
            points: 60
            slots: [
                "Command"
                "Hardpoint"
                "Crew"
                "Crew"
                "Gunner"
                "Team"
                "Cargo"
                "Cargo"
            ]
        }
        {
            name: "Separatist Privateers"
            id: 375
            faction: "Separatist Alliance"
            ship: "C-ROC Cruiser"
            skill: 7
            engagement: 1
            points: 58
            slots: [
                "Command"
                "Hardpoint"
                "Crew"
                "Crew"
                "Tactical Relay"
                "Team"
                "Cargo"
                "Device"
                "Configuration"
            ]
        }
        {
            name: "Syndicate Smugglers"
            id: 376
            faction: "Scum and Villainy"
            ship: "C-ROC Cruiser"
            skill: 7
            engagement: 1
            points: 58
            slots: [
                "Command"
                "Hardpoint"
                "Crew"
                "Crew"
                "Team"
                "Cargo"
                "Device"
                "Illicit"
                "Title"
                "Configuration"
            ]
        }
        {
            name: "Jarek Yeager"
            id: 377
            faction: "Resistance"
            unique: true
            ship: "Fireball"
            skill: 5
            points: 33
            slots: [
                "Talent"
                "Missile"
                "Astromech"
                "Illicit"
                "Modification"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Kazuda Xiono"
            id: 378
            faction: "Resistance"
            unique: true
            ship: "Fireball"
            skill: 4
            points: 40
            slots: [
                "Talent"
                "Missile"
                "Astromech"
                "Illicit"
                "Modification"
                "Modification"
                "Title"
            ]
        }
        {
            name: "R1-J5"
            id: 379
            faction: "Resistance"
            unique: true
            ship: "Fireball"
            skill: 1
            points: 29
            slots: [
                "Missile"
                "Crew"
                "Illicit"
                "Modification"
                "Modification"
                "Title"
            ]
            ship_override:
                actions: [
                    "Calculate"
                    "Evade"
                    "Barrel Roll"
                    "Slam"
                ]
        }
        {
            name: "Colossus Station Mechanic"
            id: 380
            faction: "Resistance"
            ship: "Fireball"
            skill: 2
            points: 26
            slots: [
                "Missile"
                "Astromech"
                "Illicit"
                "Modification"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Major Vonreg"
            id: 381
            faction: "First Order"
            unique: true
            skill: 6
            ship: "TIE/Ba Interceptor"
            points: 55
            slots: [
                "Talent"
                "Tech"
                "Missile"
                "Modification"
            ]
        }
        {
            name: '"Holo"'
            id: 382
            faction: "First Order"
            unique: true
            skill: 5
            ship: "TIE/Ba Interceptor"
            points: 53
            slots: [
                "Talent"
                "Tech"
                "Missile"
                "Modification"
            ]
        }
        {
            name: '"Ember"'
            id: 383
            faction: "First Order"
            unique: true
            skill: 4
            ship: "TIE/Ba Interceptor"
            points: 48
            slots: [
                "Talent"
                "Tech"
                "Missile"
                "Modification"
            ]
        }
        {
            name: "First Order Provocateur"
            id: 384
            faction: "First Order"
            skill: 3
            ship: "TIE/Ba Interceptor"
            points: 41
            slots: [
                "Talent"
                "Tech"
                "Missile"
                "Modification"
            ]
        }
        {
            name: "Captain Phasma"
            id: 385
            faction: "First Order"
            unique: true
            skill: 4
            ship: "TIE/SF Fighter"
            points: 39
            slots: [
                "Talent"
                "Tech"
                "Missile"
                "Gunner"
                "Sensor"
                "Modification"
            ]
        }
        {
            name: '"Rush"'
            id: 386
            faction: "First Order"
            unique: true
            skill: 2
            ship: "TIE/VN Silencer"
            points: 57
            slots: [
                "Tech"
                "Torpedo"
                "Missile"
            ]
        }
        {
            name: "Zizi Tlo"
            id: 387
            faction: "Resistance"
            unique: true
            skill: 5
            charge: 1
            recurring: true
            ship: "RZ-2 A-Wing"
            points: 41
            slots: [
                "Talent"
                "Talent"
                "Missile"
                "Tech"
            ]
        }
        {
            name: "Ronith Blario"
            id: 388
            faction: "Resistance"
            unique: true
            skill: 2
            ship: "RZ-2 A-Wing"
            points: 34
            slots: [
                "Talent"
                "Missile"
                "Tech"
            ]
        }
        {
            name: "Paige Tico"
            id: 389
            faction: "Resistance"
            unique: true
            skill: 5
            ship: "MG-100 StarFortress"
            points: 58
            charge: 1
            recurring: true
            slots: [
                "Talent"
                "Sensor"
                "Tech"
                "Crew"
                "Gunner"
                "Gunner"
                "Device"
                "Device"
                "Modification"
            ]
        }
        {
            name: "K-2SO"
            id: 390
            faction: "Rebel Alliance"
            unique: true
            skill: 3
            ship: "U-Wing"
            points: 46
            slots: [
                "Talent"
                "Sensor"
                "Crew"
                "Crew"
                "Modification"
                "Configuration"
            ]
            ship_override:
                actions: [
                    "Calculate"
                    "Lock"
                ]
        }
        {
            name: "Gina Moonsong"
            id: 391
            faction: "Rebel Alliance"
            unique: true
            skill: 5
            ship: "B-Wing"
            points: 50
            slots: [
                "Talent"
                "Sensor"
                "Cannon"
                "Cannon"
                "Torpedo"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Alexsandr Kallus"
            id: 392
            faction: "Rebel Alliance"
            unique: true
            skill: 4
            ship: "VCX-100"
            points: 68
            slots: [
                "Talent"
                "Torpedo"
                "Sensor"
                "Turret"
                "Crew"
                "Crew"
                "Modification"
                "Gunner"
                "Title"
            ]
        }
        {
            name: "Leia Organa"
            id: 393
            faction: "Rebel Alliance"
            unique: true
            skill: 5
            ship: "YT-1300"
            points: 77
            force: 1
            slots: [
                "Force"
                "Missile"
                "Gunner"
                "Crew"
                "Crew"
                "Modification"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Fifth Brother"
            id: 394
            faction: "Galactic Empire"
            unique: true
            skill: 4
            darkside: true
            ship: "TIE Advanced Prototype"
            points: 42
            force: 2
            slots: [
                "Force"
                "Sensor"
                "Missile"
            ]
        }
        {
            name: '"Vagabond"'
            id: 395
            faction: "Galactic Empire"
            unique: true
            skill: 2
            ship: "TIE Striker"
            points: 34
            slots: [
                "Talent"
                "Gunner"
                "Device"
                "Modification"
            ]
        }
        {
            name: "Morna Kee"
            id: 396
            faction: "Galactic Empire"
            unique: true
            skill: 4
            ship: "VT-49 Decimator"
            points: 75
            charge: 3
            slots: [
                "Talent"
                "Torpedo"
                "Crew"
                "Crew"
                "Crew"
                "Gunner"
                "Device"
                "Modification"
                "Title"
            ]
        }
        {
            name: "Lieutenant LeHuse"
            id: 397
            faction: "First Order"
            unique: true
            skill: 5
            ship: "TIE/SF Fighter"
            points: 38
            slots: [
                "Talent"
                "Tech"
                "Missile"
                "Gunner"
                "Sensor"
                "Modification"
            ]
        }
        {
            name: "Bossk (Z-95 Headhunter)"
            xws: "bossk-z95af4headhunter"
            canonical_name: 'Bossk'.canonicalize()
            id: 398
            faction: "Scum and Villainy"
            unique: true
            skill: 4
            ship: "Z-95 Headhunter"
            points: 29
            slots: [
                "Talent"
                "Missile"
                "Illicit"
                "Modification"
            ]
        }
        {
            name: "G4R-GOR V/M"
            id: 399
            faction: "Scum and Villainy"
            unique: true
            skill: 0
            ship: "M3-A Interceptor"
            points: 28
            slots: [
                "Modification"
                "HardpointShip"
            ]
            ship_override:
                actions: [
                    "Calculate"
                    "Evade"
                    "Lock"
                    "Barrel Roll"
                ]
        }
        {
            name: "Nom Lumb"
            id: 400
            faction: "Scum and Villainy"
            unique: true
            skill: 1
            ship: "JumpMaster 5000"
            points: 38
            slots: [
                "Torpedo"
                "Cannon"
                "Crew"
                "Gunner"
                "Illicit"
                "Modification"
                "Title"
            ]
        }
        {
            name: "First Order Courier"
            id: 401
            faction: "First Order"
            unique: true
            skill: 2
            ship: "Xi-class Light Shuttle"
            points: 200
            slots: [
                "Modification"
            ]
        }
        {
            name: "Agent Terex"
            id: 402
            faction: "First Order"
            skill: 3
            ship: "Xi-class Light Shuttle"
            points: 200
            slots: [
                "Crew"
                "Modification"
            ]
        }
        {
            name: "Unnamed I4"
            id: 403
            faction: "First Order"
            unique: true
            skill: 4
            ship: "Xi-class Light Shuttle"
            points: 200
            slots: [
                "Crew"
                "Modification"
            ]
        }
        {
            name: "Commander Malarus (Xi-class Light Shuttle)"
            id: 404
            faction: "First Order"
            unique: true
            skill: 5
            ship: "Xi-class Light Shuttle"
            points: 200
            slots: [
                "Crew"
                "Modification"
            ]
        }
        {
            name: "Generic I1"
            id: 405
            faction: "Separatist Alliance"
            skill: 1
            ship: "HMP Droid Gunship"
            points: 200
            slots: [
                "Crew"
                "Modification"
            ]
        }
        {
            name: "Unnamed I1"
            id: 406
            faction: "Separatist Alliance"
            skill: 1
            ship: "HMP Droid Gunship"
            points: 200
            slots: [
                "Crew"
                "Modification"
            ]
        }
        {
            name: "Separatist Predator"
            id: 407
            faction: "Separatist Alliance"
            skill: 3
            ship: "HMP Droid Gunship"
            points: 200
            slots: [
                "Crew"
                "Modification"
            ]
        }
        {
            name: "Unnamed I2"
            id: 408
            faction: "Separatist Alliance"
            skill: 2
            ship: "HMP Droid Gunship"
            points: 200
            slots: [
                "Crew"
                "Modification"
            ]
        }
        {
            name: "Unnamed I1"
            id: 409
            faction: "Separatist Alliance"
            skill: 1
            ship: "HMP Droid Gunship"
            points: 200
            slots: [
                "Crew"
                "Modification"
            ]
        }
        {
            name: "Unnamed I3"
            id: 410
            faction: "Separatist Alliance"
            skill: 3
            ship: "HMP Droid Gunship"
            points: 200
            slots: [
                "Crew"
                "Modification"
            ]
        }
        {
            name: "Onderon Exterminator"
            id: 411
            faction: "Separatist Alliance"
            skill: 3
            max_per_squad: 2
            ship: "HMP Droid Gunship"
            points: 200
            slots: [
                "Crew"
                "Modification"
            ]
        }
        {
            name: "212th Battalion Pilot"
            id: 412
            faction: "Galactic Republic"
            skill: 2
            ship: "LAAT/i Gunship"
            points: 200
            slots: [
                "Crew"
                "Modification"
            ]
        }
        {
            name: '"Halo"'
            id: 413
            faction: "Galactic Republic"
            skill: 2
            unique: true
            ship: "LAAT/i Gunship"
            points: 200
            slots: [
                "Crew"
                "Modification"
            ]
        }
        {
            name: '"Warthog"'
            id: 414
            faction: "Galactic Republic"
            skill: 3
            unique: true
            ship: "LAAT/i Gunship"
            points: 200
            slots: [
                "Crew"
                "Modification"
            ]
        }
        {
            name: '"Hawk"'
            id: 415
            faction: "Galactic Republic"
            skill: 4
            unique: true
            ship: "LAAT/i Gunship"
            points: 200
            slots: [
                "Crew"
                "Modification"
            ]
        }
        {
            name: "Cardia Academy Pilot"
            id: 416
            faction: "Galactic Empire"
            skill: 1
            ship: "TIE/rb Heavy"
            points: 200
            slots: [
                "Crew"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Onyx Squadron Sentry"
            id: 417
            faction: "Galactic Empire"
            skill: 3
            ship: "TIE/rb Heavy"
            points: 200
            slots: [
                "Talent"
                "Cannon"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: "Lytham Dree"
            id: 418
            faction: "Galactic Empire"
            skill: 3
            unique: true
            ship: "TIE/rb Heavy"
            points: 200
            slots: [
                "Talent"
                "Cannon"
                "Modification"
                "Configuration"
            ]
        }
        {
            name: '"Rampage"'
            id: 419
            faction: "Galactic Empire"
            skill: 4
            unique: true
            ship: "TIE/rb Heavy"
            points: 200
            slots: [
                "Talent"
                "Cannon"
                "Modification"
                "Configuration"
            ]
        }

    ]


    upgradesById: [
       {
           name: '"Chopper" (Astromech)'
           id: 0
           slot: "Astromech"
           canonical_name: '"Chopper"'.canonicalize()
           points: 2
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: '"Genius"'
           id: 1
           slot: "Astromech"
           points: 2
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "R2 Astromech"
           id: 2
           slot: "Astromech"
           pointsarray: [3,5,7,9]
           variableagility: true
           charge: 2
       }
       {
           name: "R2-D2"
           id: 3
           unique: true
           slot: "Astromech"
           pointsarray: [4,6,8,10]
           variableagility: true
           charge: 3
           faction: "Rebel Alliance"
       }
       {
           name: "R3 Astromech"
           id: 4
           slot: "Astromech"
           points: 3
       }
       {
           name: "R4 Astromech"
           id: 5
           slot: "Astromech"
           points: 2
           restriction_func: (ship) ->
                not (ship.data.large? or ship.data.medium? or ship.data.huge?)
           modifier_func: (stats) ->
                for turn in [0 ... stats.maneuvers[1].length]
                    if turn > 4
                        continue
                    if stats.maneuvers[1][turn] > 0
                        if stats.maneuvers[1][turn] == 3
                            stats.maneuvers[1][turn] = 1
                        else
                            stats.maneuvers[1][turn] = 2
                    if stats.maneuvers[2][turn] > 0
                        if stats.maneuvers[2][turn] == 3
                            stats.maneuvers[2][turn] = 1
                        else
                            stats.maneuvers[2][turn] = 2
       }
       {
           name: "R5 Astromech"
           id: 6
           slot: "Astromech"
           points: 4
           charge: 2
       }
       {
           name: "R5-D8"
           id: 7
           unique: true
           slot: "Astromech"
           points: 6
           charge: 3
           faction: "Rebel Alliance"
       }
       {
           name: "R5-P8"
           id: 8
           slot: "Astromech"
           points: 4
           unique: true
           faction: "Scum and Villainy"
           charge: 3
       }
       {
           name: "R5-TK"
           id: 9
           slot: "Astromech"
           points: 0
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "Heavy Laser Cannon"
           id: 10
           slot: "Cannon"
           points: 5
           attackbull: 4
           range: """2-3"""
       }
       {
           name: "Ion Cannon"
           id: 11
           slot: "Cannon"
           points: 6
           attack: 3
           range: """1-3"""
       }
       {
           name: "Jamming Beam"
           id: 12
           slot: "Cannon"
           points: 0
           attack: 3
           range: """1-2"""
       }
       {
           name: "Tractor Beam"
           id: 13
           slot: "Cannon"
           points: 3
           attack: 3
           range: """1-3"""
       }
       {
           name: "Admiral Sloane"
           id: 14
           slot: "Crew"
           points: 9
           unique: true
           faction: "Galactic Empire"
       }
       {
           name: "Agent Kallus"
           id: 15
           slot: "Crew"
           points: 5
           unique: true
           faction: "Galactic Empire"
           applies_condition: 'Hunted'.canonicalize()
       }
       {
           name: "Boba Fett"
           id: 16
           slot: "Crew"
           points: 4
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "Baze Malbus"
           id: 17
           slot: "Crew"
           points: 3
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "C-3PO"
           id: 18
           slot: "Crew"
           points: 8
           unique: true
           faction: "Rebel Alliance"
           modifier_func: (stats) ->
                stats.actions.push 'Calculate' if 'Calculate' not in stats.actions
       }
       {
           name: "Cassian Andor"
           id: 19
           slot: "Crew"
           points: 6
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Cad Bane"
           id: 20
           slot: "Crew"
           points: 4
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "Chewbacca"
           id: 21
           slot: "Crew"
           points: 4
           unique: true
           faction: "Rebel Alliance"
           charge: 2
           recurring: true
       }
       {
           name: "Chewbacca (Scum)"
           id: 22
           slot: "Crew"
           xws: "chewbacca-crew"
           points: 4
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: '"Chopper" (Crew)'
           id: 23
           canonical_name: '"Chopper"'.canonicalize()
           xws: "chopper-crew"
           slot: "Crew"
           points: 1
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Ciena Ree"
           id: 24
           slot: "Crew"
           points: 6
           unique: true
           faction: "Galactic Empire"
           restriction_func: (ship) ->
                "Coordinate" in ship.effectiveStats().actions or "Coordinate" in ship.effectiveStats().actionsred
       }
       {
           name: "Cikatro Vizago"
           id: 25
           slot: "Crew"
           points: 1
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "Darth Vader"
           id: 26
           slot: "Crew"
           points: 14
           force: 1
           unique: true
           faction: "Galactic Empire"
           modifier_func: (stats) ->
                stats.force += 1
       }
       {
           name: "Death Troopers"
           id: 27
           slot: "Crew"
           points: 6
           unique: true
           faction: "Galactic Empire"
           restriction_func: (ship, upgrade_obj) ->
                ship.hasAnotherUnoccupiedSlotLike(upgrade_obj, upgrade_obj.slot)
           validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnUpgradeSlot upgrade_obj.slot
           also_occupies_upgrades: [ "Crew" ]
       }
       {
           name: "Director Krennic"
           id: 28
           slot: "Crew"
           points: 4
           unique: true
           faction: "Galactic Empire"
           applies_condition: 'Optimized Prototype'.canonicalize()
           modifier_func: (stats) ->
                stats.actions.push 'Lock' if 'Lock' not in stats.actions
       }
       {
           name: "Emperor Palpatine"
           id: 29
           slot: "Crew"
           points: 11
           force: 1
           unique: true
           faction: "Galactic Empire"
           restriction_func: (ship, upgrade_obj) ->
                ship.hasAnotherUnoccupiedSlotLike(upgrade_obj, upgrade_obj.slot)
           validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnUpgradeSlot upgrade_obj.slot
           also_occupies_upgrades: [ "Crew" ]
           modifier_func: (stats) ->
                stats.force += 1
       }
       {
           name: "Freelance Slicer"
           id: 30
           slot: "Crew"
           points: 3
       }
       {
           name: "4-LOM"
           id: 31
           slot: "Crew"
           points: 2
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: 'GNK "Gonk" Droid'
           id: 32
           slot: "Crew"
           points: 10
           charge: 1
       }
       {
           name: "Grand Inquisitor"
           id: 33
           slot: "Crew"
           points: 13
           unique: true
           force: 1
           faction: "Galactic Empire"
           modifier_func: (stats) ->
                stats.force += 1
       }
       {
           name: "Grand Moff Tarkin"
           id: 34
           slot: "Crew"
           points: 6
           unique: true
           faction: "Galactic Empire"
           charge: 2
           recurring: true
           restriction_func: (ship) ->
                "Lock" in ship.effectiveStats().actions or "Lock" in ship.effectiveStats().actionsred
       }
       {
           name: "Hera Syndulla"
           id: 35
           slot: "Crew"
           points: 4
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "IG-88D"
           id: 36
           slot: "Crew"
           points: 3
           unique: true
           faction: "Scum and Villainy"
           modifier_func: (stats) ->
                stats.actions.push 'Calculate' if 'Calculate' not in stats.actions

       }
       {
           name: "Informant"
           id: 37
           slot: "Crew"
           points: 5
           unique: true
           applies_condition: 'Listening Device'.canonicalize()
       }
       {
           name: "ISB Slicer"
           id: 38
           slot: "Crew"
           points: 3
           faction: "Galactic Empire"
       }
       {
           name: "Jabba the Hutt"
           id: 39
           slot: "Crew"
           points: 6
           unique: true
           faction: "Scum and Villainy"
           charge: 4
           restriction_func: (ship, upgrade_obj) ->
                ship.hasAnotherUnoccupiedSlotLike(upgrade_obj, upgrade_obj.slot)
           validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnUpgradeSlot upgrade_obj.slot
           also_occupies_upgrades: [ "Crew" ]
       }
       {
           name: "Jyn Erso"
           id: 40
           slot: "Crew"
           points: 2
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Kanan Jarrus"
           id: 41
           slot: "Crew"
           lightside: true
           points: 12
           force: 1
           unique: true
           faction: "Rebel Alliance"
           modifier_func: (stats) ->
                stats.force += 1
       }
       {
           name: "Ketsu Onyo"
           id: 42
           slot: "Crew"
           points: 5
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "L3-37"
           id: 43
           slot: "Crew"
           points: 4
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "Lando Calrissian"
           id: 44
           slot: "Crew"
           xws: "landocalrissian"
           points: 2
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Lando Calrissian (Scum)"
           id: 45
           slot: "Crew"
           xws: "landocalrissian-crew"
           points: 8
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "Leia Organa"
           id: 46
           slot: "Crew"
           points: 7
           unique: true
           faction: "Rebel Alliance"
           charge: 3
           recurring: true
       }
       {
           name: "Latts Razzi"
           id: 47
           slot: "Crew"
           points: 7
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "Maul"
           id: 48
           slot: "Crew"
           points: 12
           unique: true
           faction: ["Scum and Villainy", "Rebel Alliance"]
           force: 1
           modifier_func: (stats) ->
                stats.force += 1
                stats.darkside = true
           restriction_func: (ship) ->
                builder = ship.builder
                return true if builder.faction == "Scum and Villainy"
                for t, things of builder.uniques_in_use
                    if t != 'Slot'
                        return true if 'ezrabridger' in (thing.canonical_name.getXWSBaseName() for thing in things)
                false
       }
       {
           name: "Minister Tua"
           id: 49
           slot: "Crew"
           points: 7
           unique: true
           faction: "Galactic Empire"
       }
       {
           name: "Moff Jerjerrod"
           id: 50
           slot: "Crew"
           points: 8
           unique: true
           faction: "Galactic Empire"
           charge: 2
           recurring: true
           restriction_func: (ship) ->
                "Coordinate" in ship.effectiveStats().actions or "Coordinate" in ship.effectiveStats().actionsred
       }
       {
           name: "Magva Yarro"
           id: 51
           slot: "Crew"
           points: 8
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Nien Nunb"
           id: 52
           slot: "Crew"
           points: 5
           unique: true
           faction: "Rebel Alliance"
           modifier_func: (stats) ->
                for s in (stats.maneuvers)
                    if s[1] > 0
                        if s[1] == 1
                            s[1] = 2
                        else if s[1] == 3
                            s[1] = 1
                    if s[3] > 0
                        if s[3] == 1
                            s[3] = 2
                        else if s[3] == 3
                            s[3] = 1
       }
       {
           name: "Novice Technician"
           id: 53
           slot: "Crew"
           points: 4
       }
       {
           name: "Perceptive Copilot"
           id: 54
           slot: "Crew"
           points: 8
       }
       {
           name: "Qi'ra"
           id: 55
           slot: "Crew"
           points: 2
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "R2-D2 (Crew)"
           id: 56
           slot: "Crew"
           canonical_name: 'r2d2-crew'
           xws: "r2d2-crew"
           points: 10
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Sabine Wren"
           id: 57
           slot: "Crew"
           points: 3
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Saw Gerrera"
           id: 58
           slot: "Crew"
           points: 9
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Seasoned Navigator"
           id: 59
           slot: "Crew"
           pointsarray: [2,3,4,5,6,7,8,9,10]
           variableinit: true
       }
       {
           name: "Seventh Sister"
           id: 60
           slot: "Crew"
           points: 9
           force: 1
           unique: true
           faction: "Galactic Empire"
           modifier_func: (stats) ->
                stats.force += 1
       }
       {
           name: "Tactical Officer"
           id: 61
           slot: "Crew"
           points: 6
           restriction_func: (ship) ->
                "Coordinate" in ship.effectiveStats().actionsred
           modifier_func: (stats) ->
                stats.actions.push 'Coordinate' if 'Coordinate' not in stats.actions
       }
       {
           name: "Tobias Beckett"
           id: 62
           slot: "Crew"
           points: 2
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "0-0-0"
           id: 63
           slot: "Crew"
           points: 5
           unique: true
           faction: ["Scum and Villainy", "Galactic Empire"]
           restriction_func: (ship) ->
                builder = ship.builder
                return true if builder.faction == "Scum and Villainy"
                for t, things of builder.uniques_in_use
                    if t != 'Slot'
                        return true if 'darthvader' in (thing.canonical_name.getXWSBaseName() for thing in things)
                false
       }
       {
           name: "Unkar Plutt"
           id: 64
           slot: "Crew"
           points: 2
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: '"Zeb" Orrelios'
           id: 65
           slot: "Crew"
           points: 1
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Zuckuss"
           id: 66
           slot: "Crew"
           points: 2
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "Bomblet Generator"
           id: 67
           slot: "Device"
           points: 5
           charge: 2
           applies_condition: 'Bomblet'.canonicalize()
           restriction_func: (ship, upgrade_obj) ->
                ship.hasAnotherUnoccupiedSlotLike(upgrade_obj, upgrade_obj.slot)
           validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnUpgradeSlot upgrade_obj.slot
           also_occupies_upgrades: [ "Device" ]
       }
       {
           name: "Conner Nets"
           id: 68
           slot: "Device"
           points: 5
           charge: 1
           applies_condition: 'Conner Net'.canonicalize()
       }
       {
           name: "Proton Bombs"
           id: 69
           slot: "Device"
           points: 5
           charge: 2
           applies_condition: 'Proton Bomb'.canonicalize()
       }
       {
           name: "Proximity Mines"
           id: 70
           slot: "Device"
           points: 6
           charge: 2
           applies_condition: 'Proximity Mine'.canonicalize()
       }
       {
           name: "Seismic Charges"
           id: 71
           slot: "Device"
           points: 3
           charge: 2
           applies_condition: 'Seismic Charge'.canonicalize()
       }
       {
           name: "Heightened Perception"
           id: 72
           slot: "Force"
           points: 3
       }
       {
           name: "Instinctive Aim"
           id: 73
           slot: "Force"
           points: 1
       }
       {
           name: "Supernatural Reflexes"
           id: 74
           slot: "Force"
           pointsarray: [4,4,4,8,16,24,32]
           variableinit: true
           restriction_func: (ship) ->
                not (ship.data.large? or ship.data.medium? or ship.data.huge?)
       }
       {
           name: "Sense"
           id: 75
           slot: "Force"
           points: 5
       }
       {
           name: "Agile Gunner"
           id: 76
           slot: "Gunner"
           pointsarray: [7,6,5,4]
           variablebase: true
       }
       {
           name: "Bistan"
           id: 77
           slot: "Gunner"
           points: 10
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Bossk"
           id: 78
           slot: "Gunner"
           points: 9
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "BT-1"
           id: 79
           slot: "Gunner"
           points: 2
           unique: true
           faction: ["Scum and Villainy", "Galactic Empire"]
           restriction_func: (ship) ->
                builder = ship.builder
                return true if builder.faction == "Scum and Villainy"
                for t, things of builder.uniques_in_use
                    if t != 'Slot'
                        return true if 'darthvader' in (thing.canonical_name.getXWSBaseName() for thing in things)
                false
       }
       {
           name: "Dengar"
           id: 80
           slot: "Gunner"
           points: 6
           unique: true
           faction: "Scum and Villainy"
           recurring: true
           charge: 1

       }
       {
           name: "Ezra Bridger"
           id: 81
           slot: "Gunner"
           points: 12
           force: 1
           unique: true
           faction: "Rebel Alliance"
           modifier_func: (stats) ->
                stats.force += 1
       }
       {
           name: "Fifth Brother"
           id: 82
           slot: "Gunner"
           points: 12
           force: 1
           unique: true
           faction: "Galactic Empire"
           modifier_func: (stats) ->
                stats.force += 1
       }
       {
           name: "Greedo"
           id: 83
           slot: "Gunner"
           points: 1
           unique: true
           faction: "Scum and Villainy"
           charge: 1
           recurring: true
       }
       {
           name: "Han Solo"
           id: 84
           slot: "Gunner"
           xws: "hansolo"
           points: 12
           unique: true
           faction: "Rebel Alliance"
       }
       {
           name: "Han Solo (Scum)"
           id: 85
           slot: "Gunner"
           xws: "hansolo-gunner"
           points: 10
           unique: true
           faction: "Scum and Villainy"
       }
       {
           name: "Hotshot Gunner"
           id: 86
           slot: "Gunner"
           points: 7
       }
       {
           name: "Luke Skywalker"
           id: 87
           slot: "Gunner"
           points: 26
           force: 1
           unique: true
           faction: "Rebel Alliance"
           modifier_func: (stats) ->
                stats.force += 1
       }
       {
           name: "Skilled Bombardier"
           id: 88
           slot: "Gunner"
           points: 2
       }
       {
           name: "Veteran Tail Gunner"
           id: 89
           slot: "Gunner"
           points: 4
           restriction_func: (ship) ->
                ship.data.attackb?
       }
       {
           name: "Veteran Turret Gunner"
           id: 90
           slot: "Gunner"
           pointsarray: [12,9,7,7]
           variablebase: true
           restriction_func: (ship) ->
                "Rotate Arc" in ship.effectiveStats().actions or "Rotate Arc" in ship.effectiveStats().actionsred
       }
       {
           name: "Cloaking Device"
           id: 91
           slot: "Illicit"
           points: 4
           unique: true
           charge: 2
           restriction_func: (ship) ->
                not (ship.data.large? or ship.data.huge?)
       }
       {
           name: "Contraband Cybernetics"
           id: 92
           slot: "Illicit"
           points: 2
           charge: 1
       }
       {
           name: "Deadman's Switch"
           id: 93
           slot: "Illicit"
           points: 2
       }
       {
           name: "Feedback Array"
           id: 94
           slot: "Illicit"
           points: 3
       }
       {
           name: "Inertial Dampeners"
           id: 95
           slot: "Illicit"
           pointsarray: [0,1,2,3,4,5,6,7,8]
           variableinit: true
       }
       {
           name: "Rigged Cargo Chute"
           id: 96
           slot: "Illicit"
           points: 4
           charge: 1
           restriction_func: (ship) ->
                ship.data.medium?  or ship.data.large?
       }
       {
           name: "Barrage Rockets"
           id: 97
           slot: "Missile"
           points: 8
           attack: 3
           range: """2-3"""
           rangebonus: true
           charge: 5
           restriction_func: (ship, upgrade_obj) ->
               ship.hasAnotherUnoccupiedSlotLike(upgrade_obj, upgrade_obj.slot)
           validation_func: (ship, upgrade_obj) ->
               upgrade_obj.occupiesAnUpgradeSlot upgrade_obj.slot
           also_occupies_upgrades: [ 'Missile' ]
       }
       {
           name: "Cluster Missiles"
           id: 98
           slot: "Missile"
           points: 4
           attack: 3
           range: """1-2"""
           rangebonus: true
           charge: 4
       }
       {
           name: "Concussion Missiles"
           id: 99
           slot: "Missile"
           points: 6
           attack: 3
           range: """2-3"""
           rangebonus: true
           charge: 3
       }
       {
           name: "Homing Missiles"
           id: 100
           slot: "Missile"
           points: 5
           attack: 4
           range: """2-3"""
           rangebonus: true
           charge: 2
       }
       {
           name: "Ion Missiles"
           id: 101
           slot: "Missile"
           points: 3
           attack: 3
           range: """2-3"""
           rangebonus: true
           charge: 3
       }
       {
           name: "Proton Rockets"
           id: 102
           slot: "Missile"
           points: 6
           attackbull: 5
           range: """1-2"""
           rangebonus: true
           charge: 1
       }
       {
           name: "Ablative Plating"
           id: 103
           slot: "Modification"
           points: 6
           charge: 2
           restriction_func: (ship) ->
                ship.data.medium?  or ship.data.large?
       }
       {
           name: "Advanced SLAM"
           id: 104
           slot: "Modification"
           points: 3
           restriction_func: (ship) ->
                "Slam" in ship.effectiveStats().actions or "Slam" in ship.effectiveStats().actionsred
       }
       {
           name: "Afterburners"
           id: 105
           slot: "Modification"
           points: 6
           charge: 2
           restriction_func: (ship) ->
                not (ship.data.large? or ship.data.medium? or ship.data.huge?)
       }
       {
           name: "Electronic Baffle"
           id: 106
           slot: "Modification"
           points: 2
       }
       {
           name: "Engine Upgrade"
           id: 107
           slot: "Modification"
           pointsarray: [2,4,7]
           variablebase: true
           restriction_func: (ship) ->
                "Boost" in ship.effectiveStats().actionsred
           modifier_func: (stats) ->
                stats.actions.push 'Boost' if 'Boost' not in stats.actions
       }
       {
           name: "Munitions Failsafe"
           id: 108
           slot: "Modification"
           points: 1
       }
       {
           name: "Static Discharge Vanes"
           id: 109
           slot: "Modification"
           points: 6
       }
       {
           name: "Tactical Scrambler"
           id: 110
           slot: "Modification"
           points: 2
           restriction_func: (ship) ->
                ship.data.medium?  or ship.data.large?
       }
       {
           name: "Advanced Sensors"
           id: 111
           slot: "Sensor"
           points: 10
       }
       {
           name: "Collision Detector"
           id: 112
           slot: "Sensor"
           points: 6
           charge: 2
       }
       {
           name: "Fire-Control System"
           id: 113
           slot: "Sensor"
           points: 2
       }
       {
           name: "Trajectory Simulator"
           id: 114
           slot: "Sensor"
           points: 6
       }
       {
           name: "Composure"
           id: 115
           slot: "Talent"
           points: 1
           restriction_func: (ship) ->
                "Focus" in ship.effectiveStats().actions or "Focus" in ship.effectiveStats().actionsred
       }
       {
           name: "Crack Shot"
           id: 116
           slot: "Talent"
           points: 2
           charge: 1
       }
       {
           name: "Daredevil"
           id: 117
           slot: "Talent"
           points: 2
           restriction_func: (ship) ->
                "Boost" in ship.effectiveStats().actions and not (ship.data.large? or ship.data.medium? or ship.data.huge?)
       }
       {
           name: "Debris Gambit"
           id: 118
           slot: "Talent"
           points: 4
           restriction_func: (ship) ->
                not (ship.data.large? or ship.data.huge?)
           modifier_func: (stats) ->
                stats.actionsred.push 'Evade' if 'Evade' not in stats.actionsred
       }
       {
           name: "Elusive"
           id: 119
           slot: "Talent"
           points: 3
           charge: 1
           restriction_func: (ship) ->
                not ship.data.large?
       }
       {
           name: "Expert Handling"
           id: 120
           slot: "Talent"
           pointsarray: [2,3,4]
           variablebase: true
           restriction_func: (ship) ->
                "Barrel Roll" in ship.effectiveStats().actionsred
           modifier_func: (stats) ->
                stats.actions.push 'Barrel Roll' if 'Barrel Roll' not in stats.actions
       }
       {
           name: "Fearless"
           id: 121
           slot: "Talent"
           points: 3
           faction: "Scum and Villainy"
       }
       {
           name: "Intimidation"
           id: 122
           slot: "Talent"
           points: 3
       }
       {
           name: "Juke"
           id: 123
           slot: "Talent"
           points: 7
           restriction_func: (ship) ->
                not (ship.data.large? or ship.data.huge?)
       }
       {
           name: "Lone Wolf"
           id: 124
           slot: "Talent"
           points: 5
           unique: true
           recurring: true
           charge: 1
       }
       {
           name: "Marksmanship"
           id: 125
           slot: "Talent"
           points: 1
       }
       {
           name: "Outmaneuver"
           id: 126
           slot: "Talent"
           points: 6
       }
       {
           name: "Predator"
           id: 127
           slot: "Talent"
           points: 2
       }
       {
           name: "Ruthless"
           id: 128
           slot: "Talent"
           points: 1
           faction: "Galactic Empire"
       }
       {
           name: "Saturation Salvo"
           id: 129
           slot: "Talent"
           points: 4
           restriction_func: (ship) ->
                "Reload" in ship.effectiveStats().actions or "Reload" in ship.effectiveStats().actionsred
       }
       {
           name: "Selfless"
           id: 130
           slot: "Talent"
           points: 3
           faction: "Rebel Alliance"
       }
       {
           name: "Squad Leader"
           id: 131
           slot: "Talent"
           pointsarray: [2,4,6,8,10,12,14,16,18]
           variableinit: true
           unique: true
           modifier_func: (stats) ->
                if stats.actionsred?
                    stats.actionsred.push 'Coordinate' if 'Coordinate' not in stats.actionsred
       }
       {
           name: "Swarm Tactics"
           id: 132
           slot: "Talent"
           pointsarray: [3,3,3,3,3,4,5,6,7]
           variableinit: true
       }
       {
           name: "Trick Shot"
           id: 133
           slot: "Talent"
           points: 4
       }
       {
           name: "Adv. Proton Torpedoes"
           id: 134
           slot: "Torpedo"
           points: 5
           attack: 5
           range: """1"""
           rangebonus: true
           charge: 1
       }
       {
           name: "Ion Torpedoes"
           id: 135
           slot: "Torpedo"
           points: 5
           attack: 4
           range: """2-3"""
           rangebonus: true
           charge: 2
       }
       {
           name: "Proton Torpedoes"
           id: 136
           slot: "Torpedo"
           points: 13
           attack: 4
           range: """2-3"""
           rangebonus: true
           charge: 2
       }
       {
           name: "Dorsal Turret"
           id: 137
           slot: "Turret"
           points: 2
           attackt: 2
           range: """1-2"""
           modifier_func: (stats) ->
                stats.actions.push 'Rotate Arc' if 'Rotate Arc' not in stats.actions
       }
       {
           name: "Ion Cannon Turret"
           id: 138
           slot: "Turret"
           points: 5
           attackt: 3
           range: """1-2"""
           modifier_func: (stats) ->
                stats.actions.push 'Rotate Arc' if 'Rotate Arc' not in stats.actions
       }
       {
           name: "Os-1 Arsenal Loadout"
           id: 139
           points: 0
           slot: "Configuration"
           ship: "Alpha-Class Star Wing"
           confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: "Torpedo"
                }
                {
                    type: exportObj.Upgrade
                    slot: "Missile"
                }
            ]
       }
       {
           name: "Pivot Wing"
           id: 140
           points: 0
           slot: "Configuration"
           ship: "U-Wing"
       }
       {
           name: "Pivot Wing (Open)"
           id: 141
           points: 0
           skip: true
       }
       {
           name: "Servomotor S-Foils"
           id: 142
           points: 0
           slot: "Configuration"
           ship: "X-Wing"
           modifier_func: (stats) ->
                stats.actions.push 'Boost'
                stats.actions.push '*Focus'
                stats.actions.push 'R> Boost'
       }
       {
           name: "Blank"
           id: 143
           skip: true
       }
       {
           name: "Xg-1 Assault Configuration"
           id: 144
           points: 0
           slot: "Configuration"
           ship: "Alpha-Class Star Wing"
           confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: "Cannon"
                }
           ]
       }
       {
           name: "L3-37's Programming"
           id: 145
           skip: true
           points: 0
           slot: "Configuration"
           faction: "Scum and Villainy"
       }
       {
           name: "Andrasta"
           id: 146
           slot: "Title"
           points: 3
           unique: true
           faction: "Scum and Villainy"
           ship: "Firespray-31"
           confersAddons: [
              {
                  type: exportObj.Upgrade
                  slot: "Device"
              }
            ]
           modifier_func: (stats) ->
                stats.actions.push 'Reload' if 'Reload' not in stats.actions
       }
       {
           name: "Dauntless"
           id: 147
           slot: "Title"
           points: 4
           unique: true
           faction: "Galactic Empire"
           ship: "VT-49 Decimator"
       }
       {
           name: "Ghost"
           id: 148
           slot: "Title"
           unique: true
           points: 0
           faction: "Rebel Alliance"
           ship: "VCX-100"
       }
       {
           name: "Havoc"
           id: 149
           slot: "Title"
           points: 2
           unique: true
           faction: "Scum and Villainy"
           ship: "Scurrg H-6 Bomber"
           unequips_upgrades: [
                'Crew'
           ]
           also_occupies_upgrades: [
                'Crew'
           ]
           confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: 'Sensor'
                }
                {
                    type: exportObj.Upgrade
                    slot: 'Astromech'
                }
           ]
       }
       {
           name: "Hound's Tooth"
           id: 150
           slot: "Title"
           points: 1
           unique: true
           faction: "Scum and Villainy"
           ship: "YV-666"
       }
       {
           name: "IG-2000"
           id: 151
           slot: "Title"
           points: 1
           faction: "Scum and Villainy"
           ship: "Aggressor"
       }
       {
           name: "Lando's Millennium Falcon"
           id: 152
           slot: "Title"
           points: 3
           unique: true
           faction: "Scum and Villainy"
           ship: "Customized YT-1300"
       }
       {
           name: "Marauder"
           id: 153
           slot: "Title"
           points: 6
           unique: true
           faction: "Scum and Villainy"
           ship: "Firespray-31"
           confersAddons: [
              {
                  type: exportObj.Upgrade
                  slot: "Gunner"
              }
            ]
       }
       {
           name: "Millennium Falcon"
           id: 154
           slot: "Title"
           points: 3
           unique: true
           faction: "Rebel Alliance"
           ship: "YT-1300"
           modifier_func: (stats) ->
                stats.actions.push 'Evade' if 'Evade' not in stats.actions
       }
       {
           name: "Mist Hunter"
           id: 155
           slot: "Title"
           points: 1
           unique: true
           faction: "Scum and Villainy"
           ship: "G-1A Starfighter"
           modifier_func: (stats) ->
                stats.actions.push 'Barrel Roll' if 'Barrel Roll' not in stats.actions
           confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: "Cannon"
                }
           ]
       }
       {
           name: "Moldy Crow"
           id: 156
           slot: "Title"
           points: 18
           unique: true
           ship: "HWK-290"
           modifier_func: (stats) ->
                stats.attack = 3
       }
       {
           name: "Outrider"
           id: 157
           slot: "Title"
           points: 14
           unique: true
           faction: "Rebel Alliance"
           ship: "YT-2400"
       }
       {
           id: 158
           skip: true
       }
       {
           name: "Punishing One"
           id: 159
           slot: "Title"
           points: 5
           unique: true
           faction: "Scum and Villainy"
           ship: "JumpMaster 5000"
           unequips_upgrades: [
                'Crew'
           ]
           also_occupies_upgrades: [
                'Crew'
           ]
           confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: 'Astromech'
                }
           ]
       }
       {
           name: "Shadow Caster"
           id: 160
           slot: "Title"
           points: 1
           unique: true
           faction: "Scum and Villainy"
           ship: "Lancer-Class Pursuit Craft"
       }
       {
           name: "Slave I"
           id: 161
           slot: "Title"
           points: 5
           unique: true
           faction: "Scum and Villainy"
           ship: "Firespray-31"
           confersAddons: [
              {
                  type: exportObj.Upgrade
                  slot: "Torpedo"
              }
            ]
       }
       {
           name: "ST-321"
           id: 162
           slot: "Title"
           points: 4
           unique: true
           faction: "Galactic Empire"
           ship: "Lambda-Class Shuttle"
       }
       {
           name: "Virago"
           id: 163
           slot: "Title"
           points: 8
           unique: true
           charge: 2
           ship: "StarViper"
           modifier_func: (stats) ->
                stats.shields += 1
           confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: "Modification"
                }
            ]
       }
       {
           name: "Hull Upgrade"
           id: 164
           slot: "Modification"
           pointsarray: [2,3,5,7]
           variableagility: true
           modifier_func: (stats) ->
                stats.hull += 1
       }
       {
           name: "Shield Upgrade"
           id: 165
           slot: "Modification"
           pointsarray: [3,4,6,8]
           variableagility: true
           modifier_func: (stats) ->
                stats.shields += 1
       }
       {
           name: "Stealth Device"
           id: 166
           slot: "Modification"
           pointsarray: [3,4,6,8]
           variableagility: true
           charge: 1
           modifier_func: (stats) ->
                stats.agility += 1
       }
       {
           name: "Phantom"
           id: 167
           slot: "Title"
           points: 0
           unique: true
           faction: "Rebel Alliance"
           ship: ["Attack Shuttle","Sheathipede-Class Shuttle"]
       }
       {
            id: 168
            skip: true
       }
       {
            id: 169
            skip: true
       }
       {
            id: 170
            skip: true
       }
       {
            name: "Black One"
            id: 171
            slot: "Title"
            unique: true
            charge: 1
            points: 2
            faction: "Resistance"
            ship: "T-70 X-Wing"
            modifier_func: (stats) ->
                stats.actions.push 'Slam' if 'Slam' not in stats.actions
       }
       {
            name: "Heroic"
            id: 172
            slot: "Talent"
            points: 1
            faction: "Resistance"
       }
       {
            name: "Rose Tico"
            id: 173
            slot: "Crew"
            points: 9
            unique: true
            faction: "Resistance"
       }
       {
            name: "Finn"
            id: 174
            slot: "Gunner"
            points: 10
            unique: true
            faction: "Resistance"
       }
       {
            name: "Integrated S-Foils"
            id: 175
            slot: "Configuration"
            points: 0
            ship: "T-70 X-Wing"
            modifier_func: (stats) ->
                stats.actions.push 'Barrel Roll'
                stats.actions.push '*Focus'
                stats.actions.push 'R> Barrel Roll'
       }
       {
            name: "Integrated S-Foils (Open)"
            id: 176
            skip: true
       }
       {
            name: "Targeting Synchronizer"
            id: 177
            slot: "Tech"
            points: 4
            restriction_func: (ship) ->
                "Lock" in ship.effectiveStats().actions or "Lock" in ship.effectiveStats().actionsred
       }
       {
            name: "Primed Thrusters"
            id: 178
            slot: "Tech"
            pointsarray: [4,5,6,7,8,9,10,11,12]
            variableinit: true
            restriction_func: (ship) ->
                not (ship.data.large? or ship.data.medium? or ship.data.huge?)
       }
       {
            name: "Kylo Ren"
            id: 179
            slot: "Crew"
            points: 11
            force: 1
            faction: "First Order"
            unique: true
            applies_condition: '''I'll Show You the Dark Side'''.canonicalize()
            modifier_func: (stats) ->
                stats.force += 1
       }
       {
            name: "General Hux"
            id: 180
            slot: "Crew"
            points: 6
            unique: true
            faction: "First Order"
            restriction_func: (ship) ->
                "Coordinate" in ship.effectiveStats().actions
       }
       {
            name: "Fanatical"
            id: 181
            slot: "Talent"
            points: 2
            faction: "First Order"
       }
       {
            name: "Special Forces Gunner"
            id: 182
            slot: "Gunner"
            points: 9
            faction: "First Order"
            ship: "TIE/SF Fighter"
       }
       {
            name: "Captain Phasma"
            id: 183
            slot: "Crew"
            unique: true
            points: 5
            faction: "First Order"
       }
       {
            name: "Supreme Leader Snoke"
            id: 184
            slot: "Crew"
            unique: true
            points: 13
            force: 1
            faction: "First Order"
            restriction_func: (ship, upgrade_obj) ->
                ship.hasAnotherUnoccupiedSlotLike(upgrade_obj, upgrade_obj.slot)
            validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnUpgradeSlot upgrade_obj.slot
            also_occupies_upgrades: [ "Crew" ]
            modifier_func: (stats) ->
                stats.force += 1
       }
       {
            name: "Hyperspace Tracking Data"
            id: 185
            slot: "Tech"
            faction: "First Order"
            points: 10
            restriction_func: (ship) ->
                ship.data.large?
       }
       {
            name: "Advanced Optics"
            id: 186
            slot: "Tech"
            points: 4
       }
       {
            name: "Rey"
            id: 187
            slot: "Gunner"
            xws: "rey-gunner"
            points: 14
            unique: true
            force: 1
            faction: "Resistance"
            modifier_func: (stats) ->
                stats.force += 1
       }
       {
            name: "Chewbacca (Resistance)"
            id: 188
            slot: "Crew"
            xws: "chewbacca-crew-swz19"
            points: 5
            charge: 2
            unique: true
            faction: "Resistance"
       }
       {
            name: "Paige Tico"
            id: 189
            slot: "Gunner"
            points: 7
            unique: true
            faction: "Resistance"
       }
       {
            name: "R2-HA"
            id: 190
            slot: "Astromech"
            points: 4
            unique: true
            faction: "Resistance"
       }
       {
            name: "C-3PO (Resistance)"
            id: 191
            slot: "Crew"
            xws: "c3po-crew"
            points: 6
            unique: true
            faction: "Resistance"
            modifier_func: (stats) ->
                stats.actions.push 'Calculate' if 'Calculate' not in stats.actions
                stats.actionsred.push 'Coordinate' if 'Coordinate' not in stats.actionsred
       }
       {
            name: "Han Solo (Resistance)"
            id: 192
            slot: "Crew"
            xws: "hansolo-crew"
            points: 4
            unique: true
            faction: "Resistance"
            modifier_func: (stats) ->
                stats.actionsred.push 'Evade' if 'Evade' not in stats.actionsred
       }
       {
            name: "Rey's Millennium Falcon"
            id: 193
            slot: "Title"
            points: 2
            unique: true
            ship: "Scavenged YT-1300"
            faction: "Resistance"
       }
       {
            name: "Petty Officer Thanisson"
            id: 194
            slot: "Crew"
            points: 4
            unique: true
            faction: "First Order"
       }
       {
            name: "BB-8"
            id: 195
            slot: "Astromech"
            pointsarray: [2,3,4,5,6,7,8]
            variableinit: true
            charge: 2
            unique: true
            faction: "Resistance"
       }
       {
            name: "BB Astromech"
            id: 196
            slot: "Astromech"
            pointsarray: [0,1,2,3,4,5,6]
            variableinit: true
            charge: 2
            faction: "Resistance"
       }
       {
            name: "M9-G8"
            id: 197
            slot: "Astromech"
            points: 7
            unique: true
            faction: "Resistance"
       }
       {
            name: "Ferrosphere Paint"
            id: 198
            slot: "Tech"
            points: 5
            faction: "Resistance"
       }
       {
            name: "Brilliant Evasion"
            id: 199
            slot: "Force"
            points: 3
       }
       {
            name: "Calibrated Laser Targeting"
            id: 200
            slot: "Configuration"
            ship: "Delta-7 Aethersprite"
            pointsarray: [0,0,1,2,3,4,5]
            variableinit: true
            restriction_func: (ship, upgrade_obj) ->
                ship.hasAnotherUnoccupiedSlotLike(upgrade_obj, "Modification")
            validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnUpgradeSlot "Modification"
            also_occupies_upgrades: [ "Modification" ]
       }
       {
            name: "Delta-7B"
            id: 201
            slot: "Configuration"
            ship: "Delta-7 Aethersprite"
            pointsarray: [6,9,12,15,18,21,24]
            variableinit: true
            modifier_func: (stats) ->
                stats.attack += 1
                stats.agility += -1
                stats.shields += 2
       }
       {
            name: "Biohexacrypt Codes"
            id: 202
            slot: "Tech"
            points: 1
            faction: "First Order"
            restriction_func: (ship) ->
                "Lock" in ship.effectiveStats().actions or "Lock" in ship.effectiveStats().actionsred
       }
       {
            name: "Predictive Shot"
            id: 203
            slot: "Force"
            points: 1
       }
       {
            name: "Hate"
            id: 204
            slot: "Force"
            pointsarray: [3,6,9]
            variablebase: true
            restriction_func: (ship) ->
                ship.effectiveStats().darkside == true
       }
       {
            name: "R5-X3"
            id: 205
            unique: true
            slot: "Astromech"
            faction: "Resistance"
            charge: 2
            points: 5
       }
       {
            name: "Pattern Analyzer"
            id: 206
            slot: "Tech"
            points: 5
       }
       {
            name: "Impervium Plating"
            id: 207
            ship: "Belbullab-22 Starfighter"
            charge: 2
            slot: "Modification"
            points: 4
       }
       {
            name: "Grappling Struts"
            id: 208
            ship: "Vulture-class Droid Fighter"
            slot: "Configuration"
            points: 1
       }
       {
            name: "Energy-Shell Charges"
            id: 209
            faction: "Separatist Alliance"
            slot: "Missile"
            attack: 3
            range: """2-3"""
            rangebonus: true
            charge: 1
            points: 5
            restriction_func: (ship) ->
                "Calculate" in ship.effectiveStats().actions or "Calculate" in ship.effectiveStats().actionsred
       }
       {
            name: "Dedicated"
            id: 210
            faction: "Galactic Republic"
            slot: "Talent"
            points: 1
            restriction_func: (ship) ->
                not ship.pilot.unique
       }
       {
            name: "Synchronized Console"
            id: 211
            faction: "Galactic Republic"
            slot: "Modification"
            points: 1
            restriction_func: (ship) ->
                "Lock" in ship.effectiveStats().actions or "Lock" in ship.effectiveStats().actionsred
       }
       {
            name: "Battle Meditation"
            id: 212
            faction: "Galactic Republic"
            slot: "Force"
            pointsarray: [4,4,4,4,6,8,10]
            variableinit: true
            modifier_func: (stats) ->
                stats.actions.push 'F-Coordinate' if 'F-Coordinate' not in stats.actions
       }
       {
            name: "R4-P Astromech"
            id: 213
            faction: "Galactic Republic"
            slot: "Astromech"
            charge: 2
            points: 2
       }
       {
            name: "R4-P17"
            id: 214
            unique: true
            faction: "Galactic Republic"
            slot: "Astromech"
            charge: 2
            points: 5
       }
       {
            name: "Spare Parts Canisters"
            id: 215
            slot: "Modification"
            charge: 1
            points: 4
            restriction_func: (ship) ->
                if "Astromech" in ship.pilot.slots
                    if not ship.isSlotOccupied "Astromech"
                        return true
                else if ship.doesSlotExist "Astromech"
                    if not ship.isSlotOccupied "Astromech"
                        return true
                false
       }
       {
            name: "Scimitar"
            id: 216
            unique: true
            ship: "Sith Infiltrator"
            slot: "Title"
            faction: "Separatist Alliance"
            points: 4
            modifier_func: (stats) ->
                stats.actionsred.push 'Cloak' if 'Cloak' not in stats.actionsred
                stats.actions.push 'Jam' if 'Jam' not in stats.actions
       }
       {
            name: "Chancellor Palpatine"
            id: 217
            unique: true
            slot: "Crew"
            faction: ["Galactic Republic", "Separatist Alliance"]
            force: 1
            points: 14
            modifier_func: (stats) ->
                stats.force += 1
                stats.actions.push 'F-Coordinate' if 'F-Coordinate' not in stats.actions
       }
       {
            name: "Count Dooku"
            id: 218
            unique: true
            slot: "Crew"
            force: 1
            faction: "Separatist Alliance"
            points: 10
            modifier_func: (stats) ->
                stats.force += 1
       }
       {
            name: "General Grievous"
            id: 219
            unique: true
            slot: "Crew"
            charge: 1
            faction: "Separatist Alliance"
            points: 3
       }
       {
            name: "K2-B4"
            id: 220
            unique: true
            solitary: true
            slot: "Tactical Relay"
            faction: "Separatist Alliance"
            points: 5
       }
       {
            name: "DRK-1 Probe Droids"
            id: 221
            slot: "Device"
            unique: true
            faction: "Separatist Alliance"
            charge: 2
            points: 5
            applies_condition: '''DRK-1 Probe Droid'''.canonicalize()
       }
       {
            name: "Kraken"
            id: 222
            unique: true
            slot: "Tactical Relay"
            solitary: true
            faction: "Separatist Alliance"
            points: 11
            modifier_func: (stats) ->
                stats.actions.push 'Calculate' if 'Calculate' not in stats.actions
       }
       {
            name: "TV-94"
            id: 223
            unique: true
            solitary: true
            slot: "Tactical Relay"
            faction: "Separatist Alliance"
            points: 5
       }
       {
            name: "Discord Missiles"
            id: 224
            slot: "Missile"
            faction: "Separatist Alliance"
            charge: 1
            max_per_squad: 3
            points: 4
            applies_condition: '''Buzz Droid Swarm'''.canonicalize()
       }
       {
            name: "Clone Commander Cody"
            id: 225
            unique: true
            slot: "Gunner"
            faction: "Galactic Republic"
            points: 4
       }
       {
            name: "R4-P44"
            id: 226
            unique: true
            faction: "Galactic Republic"
            slot: "Astromech"
            points: 3
       }
       {
            name: "Seventh Fleet Gunner"
            id: 227
            charge: 1
            slot: "Gunner"
            faction: "Galactic Republic"
            points: 9
       }
       {
            name: "Treacherous"
            id: 228
            charge: 1
            slot: "Talent"
            faction: "Separatist Alliance"
            points: 2
       }
       {
            name: "Soulless One"
            id: 229
            slot: "Title"
            unique: true
            ship: "Belbullab-22 Starfighter"
            faction: "Separatist Alliance"
            points: 6
            modifier_func: (stats) ->
                stats.hull += 2
       }
       {
            name: "GA-97"
            id: 230
            slot: "Crew"
            points: 6
            charge: 5
            recurring: true
            faction: "Resistance"
            unique: true
            modifier_func: (stats) ->
               stats.actions.push 'Calculate' if 'Calculate' not in stats.actions
            applies_condition: '''It's the Resistance'''.canonicalize()
       }
       {
            name: "Kaydel Connix"
            id: 231
            slot: "Crew"
            points: 5
            faction: "Resistance"
            unique: true
       }
       {
           name: "Autoblasters"
           id: 232
           slot: "Cannon"
           points: 3
           attack: 2
           range: """1-2"""
       }
       {
           name: "R2-C4"
           id: 233
           unique: true
           slot: "Astromech"
           points: 5
           faction: "Galactic Republic"
       }
       {
           name: "Plasma Torpedoes"
           id: 234
           slot: "Torpedo"
           points: 8
           attack: 3
           range: """2-3"""
           rangebonus: true
           charge: 2
       }
       {
            name: "Electro-Proton Bomb"
            id: 235
            unique: true
            slot: "Device"
            points: 11
            charge: 1
            restriction_func: (ship, upgrade_obj) ->
                ("Reload" in ship.effectiveStats().actions or "Reload" in ship.effectiveStats().actionsred) and ship.hasAnotherUnoccupiedSlotLike(upgrade_obj, "Modification")
            validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnUpgradeSlot "Modification"
            also_occupies_upgrades: [ "Modification" ]
            applies_condition: 'Electro-Proton Bomb'.canonicalize()
       }
       {
            name: "Delayed Fuses"
            id: 236
            slot: "Modification"
            points: 1
       }
       {
            name: "Landing Struts"
            id: 237
            ship: "Hyena-Class Droid Bomber"
            slot: "Configuration"
            points: 1
       }
       {
            name: "Diamond-Boron Missiles"
            id: 238
            unique: true
            slot: "Missile"
            points: 6
            attack: 3
            range: """2-3"""
            rangebonus: true
            charge: 3
            restriction_func: (ship, upgrade_obj) ->
                ship.hasAnotherUnoccupiedSlotLike(upgrade_obj, upgrade_obj.slot)
            validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnUpgradeSlot upgrade_obj.slot
            also_occupies_upgrades: [ 'Missile' ]
       }
       {
            name: "TA-175"
            id: 239
            unique: true
            slot: "Tactical Relay"
            solitary: true
            faction: "Separatist Alliance"
            points: 11
       }
       {
            name: "Passive Sensors"
            id: 240
            slot: "Sensor"
            charge: 1
            recurring: true
            pointsarray: [2,2,2,2,2,4,6,7,8]
            variableinit: true
       }
       {
            name: "R2-A6"
            id: 241
            unique: true
            slot: "Astromech"
            faction: "Galactic Republic"
            points: 6
       }
       {
            name: "Amilyn Holdo"
            id: 242
            unique: true
            slot: "Crew"
            faction: "Resistance"
            points: 8
       }
       {
            name: "Larma D'Acy"
            id: 243
            unique: true
            slot: "Crew"
            faction: "Resistance"
            points: 4
       }
       {
            name: "Leia Organa (Resistance)"
            id: 244
            xws: "leiaorgana-resistance"
            unique: true
            slot: "Crew"
            faction: "Resistance"
            force: 1
            points: 17
            restriction_func: (ship, upgrade_obj) ->
                ship.hasAnotherUnoccupiedSlotLike(upgrade_obj, upgrade_obj.slot)
            validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnUpgradeSlot upgrade_obj.slot
            also_occupies_upgrades: [ "Crew" ]
            modifier_func: (stats) ->
                stats.force += 1
                stats.actions.push 'F-Coordinate' if 'F-Coordinate' not in stats.actions
       }
       {
            name: "Korr Sella"
            id: 245
            unique: true
            slot: "Crew"
            faction: "Resistance"
            points: 6
       }
       {
            name: "PZ-4CO"
            id: 246
            unique: true
            slot: "Crew"
            faction: "Resistance"
            points: 6
            modifier_func: (stats) ->
                stats.actions.push 'Calculate' if 'Calculate' not in stats.actions
       }
       {
            name: "Angled Deflectors"
            id: 247
            slot: "Modification"
            pointsarray: [9,6,3,3]
            variableagility: true
            modifier_func: (stats) ->
                stats.shields -= 1
                stats.actions.push 'Reinforce' if 'Reinforce' not in stats.actions
            restriction_func: (ship) ->
                ship.data.shields > 0 and not ship.data.large?
       }
       {
            name: "Ensnare"
            id: 248
            slot: "Talent"
            pointsarray: [21,21,21,21,21,24,28]
            variableinit: true
            ship: "Nantex-Class Starfighter"
       }
       {
            name: "Targeting Computer"
            id: 249
            slot: "Modification"
            points: 3
            modifier_func: (stats) ->
                stats.actions.push 'Lock' if 'Lock' not in stats.actions
       }
       {
            name: "Precognitive Reflexes"
            id: 250
            slot: "Force"
            pointsarray: [3,3,3,4,7,10,13]
            variableinit: true
            restriction_func: (ship) ->
                not (ship.data.large? or ship.data.medium? or ship.data.huge?)
       }
       {
            name: "Foresight"
            slot: "Force"
            points: 4
            id: 251
            attackbull: 2
            range: """1-3"""
            rangebonus: true
       }
       {
            name: "C1-10P"
            id: 252
            unique: true
            slot: "Astromech"
            charge: 2
            points: 7
            faction: "Galactic Republic"
       }
       {
            name: "Ahsoka Tano"
            id: 253
            unique: true
            slot: "Gunner"
            points: 12
            faction: "Galactic Republic"
            force: 1
            modifier_func: (stats) ->
                stats.force += 1
       }
       {
            name: "C-3PO (Republic)"
            id: 254
            unique: true
            slot: "Crew"
            xws: "c3po-republic"
            points: 8
            faction: "Galactic Republic"
            modifier_func: (stats) ->
                stats.actions.push 'Calculate' if 'Calculate' not in stats.actions
       }
       {
            name: "Gravitic Deflection"
            id: 255
            slot: "Talent"
            points: 5
            ship: "Nantex-Class Starfighter"
       }
       {
            name: "Snap Shot"
            id: 256
            slot: "Talent"
            pointsarray: [7,8,9,12]
            variablebase: true
            attack: 2
            range: """2"""
            rangebonus: true

       }
       {
            name: "Agent of the Empire"
            id: 257
            unique: true
            faction: "Galactic Empire"
            slot: "Command"
            points: 4
            ship: ["TIE Advanced","TIE Advanced Prototype"]
            restriction_func: (ship) ->
                not (ship.data.large? or ship.data.medium? or ship.data.huge?)
       }
       {
            name: "First Order Elite"
            id: 258
            unique: true
            faction: "First Order"
            slot: "Command"
            ship: ["TIE/SF Fighter","TIE/VN Silencer"]
            points: 4
            restriction_func: (ship) ->
                not (ship.data.large? or ship.data.medium? or ship.data.huge?)
       }
       {
            name: "Veteran Wing Leader"
            id: 259
            slot: "Command"
            points: 2
            restriction_func: (ship) ->
                not (ship.data.large? or ship.data.medium? or ship.data.huge?)
       }
       {
            name: "Dreadnought Hunter"
            id: 260
            slot: "Command"
            points: 6
            max_per_squad: 2
            restriction_func: (ship) ->
                (not (ship.data.large? or ship.data.medium? or ship.data.huge?)) and (ship.pilot.skill > 3)
       }
       {
            name: "Admiral Ozzel"
            id: 261
            unique: true
            slot: "Command"
            points: 6
            faction: "Galactic Empire"
            restriction_func: (ship, upgrade_obj) ->
                ship.data.huge? and ship.hasAnotherUnoccupiedSlotLike(upgrade_obj, "Crew")
            validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnUpgradeSlot "Crew"
            also_occupies_upgrades: [ "Crew" ]
       }
       {
            name: "Azmorigan"
            id: 262
            unique: true
            slot: "Command"
            points: 4
            faction: "Scum and Villainy"
            restriction_func: (ship, upgrade_obj) ->
                ship.data.huge? and ship.hasAnotherUnoccupiedSlotLike(upgrade_obj, "Crew")
            validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnUpgradeSlot "Crew"
            also_occupies_upgrades: [ "Crew" ]
       }
       {
            name: "Captain Needa"
            id: 263
            unique: true
            faction: "Galactic Empire"
            slot: "Command"
            points: 8
            restriction_func: (ship, upgrade_obj) ->
                ship.data.huge? and ship.hasAnotherUnoccupiedSlotLike(upgrade_obj, "Crew")
            validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnUpgradeSlot "Crew"
            also_occupies_upgrades: [ "Crew" ]
       }
       {
            name: "Carlist Rieekan"
            id: 264
            unique: true
            faction: "Rebel Alliance"
            slot: "Command"
            points: 6
            restriction_func: (ship, upgrade_obj) ->
                ship.data.huge? and ship.hasAnotherUnoccupiedSlotLike(upgrade_obj, "Crew")
            validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnUpgradeSlot "Crew"
            also_occupies_upgrades: [ "Crew" ]
       }
       {
            name: "Jan Dodonna"
            id: 265
            unique: true
            faction: "Rebel Alliance"
            slot: "Command"
            points: 4
            restriction_func: (ship, upgrade_obj) ->
                ship.data.huge? and ship.hasAnotherUnoccupiedSlotLike(upgrade_obj, "Crew")
            validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnUpgradeSlot "Crew"
            also_occupies_upgrades: [ "Crew" ]
       }
       {
            name: "Raymus Antilles"
            id: 266
            unique: true
            slot: "Command"
            points: 12
            faction: "Rebel Alliance"
            restriction_func: (ship, upgrade_obj) ->
                ship.data.huge? and ship.hasAnotherUnoccupiedSlotLike(upgrade_obj, "Crew")
            validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnUpgradeSlot "Crew"
            also_occupies_upgrades: [ "Crew" ]
       }
       {
            name: "Stalwart Captain"
            id: 267
            unique: true
            slot: "Command"
            points: 6
            restriction_func: (ship, upgrade_obj) ->
                ship.data.huge? and ship.hasAnotherUnoccupiedSlotLike(upgrade_obj, "Crew")
            validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnUpgradeSlot "Crew"
            also_occupies_upgrades: [ "Crew" ]
       }
       {
            name: "Strategic Commander"
            id: 268
            unique: true
            slot: "Command"
            charge: 3
            points: 6
            restriction_func: (ship, upgrade_obj) ->
                ship.data.huge? and ship.hasAnotherUnoccupiedSlotLike(upgrade_obj, "Crew")
            validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnUpgradeSlot "Crew"
            also_occupies_upgrades: [ "Crew" ]
       }
       {
            name: "Ion Cannon Battery"
            id: 269
            slot: "Hardpoint"
            points: 5
            attackt: 4
            range: """2-4"""
            modifier_func: (stats) ->
                stats.actions.push 'Rotate Arc' if 'Rotate Arc' not in stats.actions
       }
       {
            name: "Targeting Battery"
            id: 270
            slot: "Hardpoint"
            points: 6
            attackt: 3
            range: """2-5"""
            modifier_func: (stats) ->
                stats.actions.push 'Rotate Arc' if 'Rotate Arc' not in stats.actions
       }
       {
            name: "Ordnance Tubes"
            id: 271
            slot: "Hardpoint"
            points: 1
       }
       {
            name: "Point-Defense Battery"
            id: 272
            slot: "Hardpoint"
            points: 9
            attackdt: 2
            range: """1-2"""
            modifier_func: (stats) ->
                stats.actions.push 'Rotate Arc' if 'Rotate Arc' not in stats.actions
       }
       {
            name: "Turbolaser Battery"
            id: 273
            slot: "Hardpoint"
            points: 13
            attackt: 3
            range: """3-5"""
            modifier_func: (stats) ->
                stats.actions.push 'Rotate Arc' if 'Rotate Arc' not in stats.actions
            restriction_func: (ship) ->
                ship.effectiveStats().energy > 4
       }
       {
            name: "Toryn Farr"
            id: 274
            unique: true
            faction: "Rebel Alliance"
            slot: "Crew"
            points: 4
            modifier_func: (stats) ->
                stats.actions.push 'Lock'
                stats.actions.push 'R> Coordinate'
            restriction_func: (ship) ->
                ship.data.huge?
       }
       {
            name: "Bombardment Specialists"
            id: 275
            slot: "Team"
            points: 6
            modifier_func: (stats) ->
                stats.actions.push '*Lock'
                stats.actions.push '> Calculate'
       }
       {
            name: "Comms Team"
            id: 276
            slot: "Team"
            points: 8
            modifier_func: (stats) ->
                stats.actions.push '*Coordinate'
                stats.actions.push '> Calculate'
                stats.actions.push '*Jam'
                stats.actions.push '> Calculate'
       }
       {
            name: "Damage Control Team"
            id: 277
            slot: "Team"
            points: 3
            modifier_func: (stats) ->
                stats.actions.push '*Reinforce'
                stats.actions.push '> Calculate'
       }
       {
            name: "Gunnery Specialists"
            id: 278
            slot: "Team"
            points: 8
            modifier_func: (stats) ->
                stats.actions.push '*Rotate Arc'
                stats.actions.push '> Calculate'
       }
       {
            name: "IG-RM Droids"
            id: 279
            slot: "Team"
            faction: "Scum and Villainy"
            points: 2
            modifier_func: (stats) ->
                stats.actions.push 'Calculate' if 'Calculate' not in stats.actions
       }
       {
            name: "Ordnance Team"
            id: 280
            slot: "Team"
            points: 4
            modifier_func: (stats) ->
                stats.actions.push '*Reload'
                stats.actions.push '> Calculate'
       }
       {
            name: "Sensor Experts"
            id: 281
            slot: "Team"
            points: 10
            modifier_func: (stats) ->
                stats.actions.push '*Lock'
                stats.actions.push '> Calculate'
       }
       {
            name: "Adaptive Shields"
            id: 282
            slot: "Cargo"
            points: 10
       }
       {
            name: "Boosted Scanners"
            id: 283
            slot: "Cargo"
            points: 8
       }
       {
            id: 284
            skip: true
       }
       {
            name: "Tibanna Reserves"
            id: 285
            slot: "Cargo"
            points: 3
            charge: 3
       }
       {
            name: "Optimized Power Core"
            id: 286
            slot: "Cargo"
            points: 6
       }
       {
            name: "Quick-Release Locks"
            id: 287
            slot: "Illicit"
            charge: 2
            points: 5
            restriction_func: (ship) ->
                ship.data.huge?
       }
       {
            name: "Saboteur's Map"
            id: 288
            slot: "Illicit"
            points: 3
            restriction_func: (ship) ->
                ship.data.huge?
       }
       {
            name: "Scanner Baffler"
            id: 289
            slot: "Illicit"
            points: 8
            restriction_func: (ship) ->
                ship.data.huge?
       }
       {
            name: "Dodonna's Pride"
            id: 290
            slot: "Title"
            unique: true
            ship: "CR90 Corellian Corvette"
            faction: "Rebel Alliance"
            points: 8
            modifier_func: (stats) ->
                stats.shields -= 2
                stats.actions.push '*Evade'
                stats.actions.push 'R> Coordinate'
                stats.actions.push '*Focus'
                stats.actions.push 'R> Coordinate'
            confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: 'Team'
                }
                {
                    type: exportObj.Upgrade
                    slot: 'Cargo'
                }
            ]
       }
       {
            name: "Jaina's Light"
            id: 291
            slot: "Title"
            unique: true
            ship: "CR90 Corellian Corvette"
            faction: "Rebel Alliance"
            points: 6
            modifier_func: (stats) ->
                stats.shields += 1
                stats.energy -= 1
       }
       {
            name: "Liberator"
            id: 292
            slot: "Title"
            unique: true
            ship: "CR90 Corellian Corvette"
            faction: "Rebel Alliance"
            points: 5
            modifier_func: (stats) ->
                stats.energy += 1
       }
       {
            name: "Tantive IV"
            id: 293
            slot: "Title"
            unique: true
            ship: "CR90 Corellian Corvette"
            faction: "Rebel Alliance"
            points: 6
            confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: 'Crew'
                }
                {
                    type: exportObj.Upgrade
                    slot: 'Crew'
                }
            ]
       }
       {
            name: "Bright Hope"
            id: 294
            slot: "Title"
            unique: true
            ship: "GR-75 Medium Transport"
            faction: "Rebel Alliance"
            points: 5
       }
       {
            name: "Luminous"
            id: 295
            slot: "Title"
            unique: true
            ship: "GR-75 Medium Transport"
            faction: "Rebel Alliance"
            points: 12
            modifier_func: (stats) ->
                stats.shields -= 1
                stats.energy += 2
       }
       {
            name: "Quantum Storm"
            id: 296
            slot: "Title"
            unique: true
            ship: "GR-75 Medium Transport"
            faction: "Rebel Alliance"
            points: 3
            modifier_func: (stats) ->
                stats.energy += 1
            confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: 'Team'
                }
                {
                    type: exportObj.Upgrade
                    slot: 'Cargo'
                }
            ]
       }
       {
            name: "Assailer"
            id: 297
            slot: "Title"
            unique: true
            ship: "Raider-class Corvette"
            faction: "Galactic Empire"
            points: 7
            modifier_func: (stats) ->
                stats.shields -= 2
                stats.hull += 2
            confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: 'Gunner'
                }
            ]
       }
       {
            name: "Corvus"
            id: 298
            slot: "Title"
            unique: true
            ship: "Raider-class Corvette"
            faction: "Galactic Empire"
            points: 3
       }
       {
            name: "Impetuous"
            id: 299
            slot: "Title"
            unique: true
            ship: "Raider-class Corvette"
            faction: "Galactic Empire"
            points: 4
            modifier_func: (stats) ->
                stats.shields -= 2
                stats.energy += 2
            confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: 'Crew'
                }
            ]
       }
       {
            name: "Instigator"
            id: 300
            slot: "Title"
            unique: true
            ship: "Raider-class Corvette"
            faction: "Galactic Empire"
            points: 6
            confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: 'Team'
                }
            ]
       }
       {
            name: "Blood Crow"
            id: 301
            slot: "Title"
            unique: true
            ship: "Gozanti-class Cruiser"
            faction: "Galactic Empire"
            points: 5
            modifier_func: (stats) ->
                stats.shields -= 1
                stats.energy += 2
            confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: 'Gunner'
                }
            ]
       }
       {
            name: "Requiem"
            id: 302
            slot: "Title"
            unique: true
            ship: "Gozanti-class Cruiser"
            faction: "Galactic Empire"
            points: 7
            modifier_func: (stats) ->
                stats.hull -= 1
                stats.energy += 1
       }
       {
            name: "Suppressor"
            id: 303
            slot: "Title"
            unique: true
            ship: "Gozanti-class Cruiser"
            faction: "Galactic Empire"
            points: 6
            modifier_func: (stats) ->
                stats.shields += 2
                stats.hull -= 2
            confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: 'Sensor'
                }
            ]
       }
       {
            name: "Vector"
            id: 304
            slot: "Title"
            unique: true
            ship: "Gozanti-class Cruiser"
            faction: "Galactic Empire"
            points: 8
            confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: 'Crew'
                }
                {
                    type: exportObj.Upgrade
                    slot: 'Cargo'
                }
            ]
       }
       {
            name: "Broken Horn"
            id: 305
            slot: "Title"
            unique: true
            ship: "C-ROC Cruiser"
            faction: "Scum and Villainy"
            points: 4
            confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: 'Crew'
                }
                {
                    type: exportObj.Upgrade
                    slot: 'Illicit'
                }
            ]
       }
       {
            name: "Merchant One"
            id: 306
            slot: "Title"
            unique: true
            ship: "C-ROC Cruiser"
            faction: "Scum and Villainy"
            points: 8
            modifier_func: (stats) ->
                stats.actionsred.push 'Evade' if 'Evade' not in stats.actionsred
                stats.actions.push 'Coordinate' if 'Coordinate' not in stats.actions
            confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: 'Turret'
                }
                {
                    type: exportObj.Upgrade
                    slot: 'Team'
                }
                {
                    type: exportObj.Upgrade
                    slot: 'Cargo'
                }
            ]
       }
       {
            name: "Insatiable Worrt"
            id: 307
            slot: "Title"
            unique: true
            ship: "C-ROC Cruiser"
            faction: "Scum and Villainy"
            points: 7
            modifier_func: (stats) ->
                stats.hull += 3
                stats.shields -= 1
                stats.energy -= 1
            confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: 'Cargo'
                }
            ]
       }
       {
            name: "Corsair Refit"
            id: 308
            slot: "Configuration"
            ship: "C-ROC Cruiser"
            max_per_squad: 2
            points: 15
            modifier_func: (stats) ->
                stats.hull += 2
                stats.shields -= 2
                stats.energy += 1
            confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: 'Cannon'
                }
                {
                    type: exportObj.Upgrade
                    slot: 'Turret'
                }
                {
                    type: exportObj.Upgrade
                    slot: 'Missile'
                }
            ]
       }
       {
            name: "Thunderstrike"
            id: 309
            slot: "Title"
            unique: true
            ship: "CR90 Corellian Corvette"
            faction: "Rebel Alliance"
            points: 4
            modifier_func: (stats) ->
                stats.hull += 3
                stats.shields -= 3
            confersAddons: [
                {
                    type: exportObj.Upgrade
                    slot: 'Gunner'
                }
            ]
       }
       {
            name: "Coaxium Hyperfuel"
            id: 310
            slot: "Illicit"
            points: 2
            restriction_func: (ship) ->
                "Slam" in ship.effectiveStats().actions
       }
       {
            name: "Mag-Pulse Warheads"
            id: 311
            slot: "Missile"
            points: 6
            attack: 3
            range: """1-3"""
            rangebonus: true
            charge: 2
       }
       {
            name: "R1-J5"
            id: 312
            slot: "Astromech"
            faction: "Resistance"
            unique: true
            points: 6
            charge: 3
       }
       {
            name: "Stabilized S-Foils"
            id: 313
            slot: "Configuration"
            ship: "B-Wing"
            points: 2
            modifier_func: (stats) ->
                stats.actions.push '*Barrel Roll'
                stats.actions.push 'R> Evade'
                stats.actions.push '*Barrel Roll'
                stats.actions.push 'R> Lock'
                stats.actionsred.push 'Reload'
       }
       {
            name: "K-2SO"
            id: 314
            slot: "Crew"
            faction: "Rebel Alliance"
            unique: true
            points: 8
            modifier_func: (stats) ->
                stats.actions.push 'Calculate'
                stats.actions.push 'Jam'
       }
       {
            name: "Kaz's Fireball"
            id: 315
            slot: "Title"
            ship: "Fireball"
            faction: "Resistance"
            unique: true
            points: 2
       }
       {
            name: "Cluster Mines"
            id: 316
            slot: "Device"
            charge: 1
            points: 8
            applies_condition: 'Cluster Mine'.canonicalize()
       }
       {
            name: "Ion Bombs"
            id: 317
            slot: "Device"
            points: 5
            charge: 2
            applies_condition: 'Ion Bomb'.canonicalize()
       }
       {
            name: "Deuterium Power Cells"
            id: 318
            slot: "Tech"
            points: 9
            charge: 2
            faction: "First Order"
            restriction_func: (ship, upgrade_obj) ->
                (ship.doesSlotExist "Modification") and (ship.hasAnotherUnoccupiedSlotLike(upgrade_obj, "Modification"))
            validation_func: (ship, upgrade_obj) ->
                upgrade_obj.occupiesAnUpgradeSlot "Modification"
            also_occupies_upgrades: [ "Modification" ]
       }
       {
            name: "Proud Tradition"
            id: 319
            slot: "Talent"
            faction: "First Order"
            points: 2
       }
       {
            name: "Commander Pyre"
            id: 320
            slot: "Crew"
            unique: true
            faction: "First Order"
            points: 200
       }
       {
            name: "Clone Captain Rex"
            id: 321
            slot: "Crew"
            unique: true
            faction: "Galactic Republic"
            points: 200
       }
       {
            name: "Yoda"
            id: 322
            slot: "Crew"
            unique: true
            force: 2
            faction: "Galactic Republic"
            points: 200
            modifier_func: (stats) ->
                stats.force += 2
                stats.actions.push 'F-Coordinate' if 'F-Coordinate' not in stats.actions
       }
       {
            name: "Repulsorlift Stabilizers"
            id: 323
            slot: "Config"
            faction: "Separatist Alliance"
            points: 200
       }
       {
            name: "Agent Terex"
            id: 324
            slot: "Crew"
            unique: true
            faction: "First Order"
            points: 200
       }
       {
            name: "Plo Koon"
            id: 325
            slot: "Crew"
            unique: true
            force: 1
            faction: "Galactic Republic"
            points: 200
            modifier_func: (stats) ->
                stats.force += 1
                stats.actions.push 'F-Reinforce' if 'F-Reinforce' not in stats.actions
       }
       {
           name: "Multi-Missle Pods"
           id: 326
           slot: "Missile"
           points: 200
           attackf: 2
           range: """1-2"""
           rangebonus: true
           charge: 5
           restriction_func: (ship, upgrade_obj) ->
               ship.hasAnotherUnoccupiedSlotLike(upgrade_obj, upgrade_obj.slot)
           validation_func: (ship, upgrade_obj) ->
               upgrade_obj.occupiesAnUpgradeSlot upgrade_obj.slot
           also_occupies_upgrades: [ 'Missile' ]
       }
       {
            name: "Kit Fisto"
            id: 327
            slot: "Crew"
            unique: true
            force: 1
            faction: "Galactic Republic"
            points: 200
            modifier_func: (stats) ->
                stats.force += 1
                stats.actions.push 'F-Evade' if 'F-Evade' not in stats.actions
       }
       {
            name: "Aayla Secura"
            id: 328
            slot: "Crew"
            unique: true
            force: 1
            faction: "Galactic Republic"
            points: 200
            modifier_func: (stats) ->
                stats.force += 1
                stats.actions.push 'Focus'
                stats.actions.push '> F-Coordinate'
       }
    ]


    conditionsById: [
        {
            name: '''Zero Condition'''
            id: 0
        }
        {
            name: 'Suppressive Fire'
            id: 1
            unique: true
        }
        {
            name: 'Hunted'
            id: 2
            unique: true
        }
        {
            name: 'Listening Device'
            id: 3
            unique: true
        }
        {
            name: 'Optimized Prototype'
            id: 4
            unique: true
        }
        {
            name: '''I'll Show You the Dark Side'''
            id: 5
            unique: true
        }
        {
            name: 'Proton Bomb'
            id: 6
        }
        {
            name: 'Seismic Charge'
            id: 7
        }
        {
            name: 'Bomblet'
            id: 8
        }
        {
            name: 'Loose Cargo'
            id: 9
        }
        {
            name: 'Conner Net'
            id: 10
        }
        {
            name: 'Proximity Mine'
            id: 11
        }
        {
            name: 'Rattled'
            id: 12
            unique: true
        }
        {
            name: 'DRK-1 Probe Droid'
            id: 13
        }
        {
            name: 'Buzz Droid Swarm'
            id: 14
        }
        {
            name: '''It's the Resistance'''
            id: 15
        }
        {
            name: 'Electro-Proton Bomb'
            id: 16
        }
        {
            name: 'Decoyed'
            id: 17
            unique: true
        }
        {
            name: 'Compromising Intel'
            id: 18
            unique: true
        }
        {
            name: 'Cluster Mine'
            id: 19
        }
        {
            name: 'Ion Bomb'
            id: 20
        }
    ]

    quickbuildsById: [
        {
            id: 0
            faction: "Galactic Empire"
            pilot: "Valen Rudor"
            ship: "TIE Fighter"
            threat: 2
            upgrades: [
                "Elusive"
                "Shield Upgrade"
            ]
        }
        {
            id: 1
            faction: "Galactic Empire"
            pilot: "Black Squadron Ace"
            ship: "TIE Fighter"
            threat: 2
            upgrades: [
                "Outmaneuver"
                "Afterburners"
                "Shield Upgrade"
            ]
        }
        {
            id: 2
            faction: "Galactic Empire"
            pilot: "Academy Pilot"
            ship: "TIE Fighter"
            threat: 1
        }
        {
            id: 3
            faction: "Galactic Empire"
            pilot: "Iden Versio"
            ship: "TIE Fighter"
            threat: 2
            upgrades: [
                "Outmaneuver"
                "Shield Upgrade"
            ]
        }
        {
            id: 4
            faction: "Galactic Empire"
            pilot: '"Night Beast"'
            ship: "TIE Fighter"
            threat: 2
            upgrades: [
                "Predator"
                "Hull Upgrade"
                "Shield Upgrade"
            ]
        }
        {
            id: 5
            faction: "Galactic Empire"
            pilot: "Obsidian Squadron Pilot"
            ship: "TIE Fighter"
            threat: 1
        }
        {
            id: 6
            faction: "Galactic Empire"
            pilot: '"Scourge" Skutu'
            ship: "TIE Fighter"
            threat: 2
            upgrades: [
                "Predator"
                "Shield Upgrade"
            ]
        }
        {
            id: 7
            faction: "Galactic Empire"
            pilot: '"Wampa"'
            ship: "TIE Fighter"
            threat: 2
            upgrades: [
                "Crack Shot"
                "Hull Upgrade"
                "Stealth Device"
            ]
        }
        {
            id: 8
            faction: "Galactic Empire"
            pilot: "Black Squadron Ace"
            ship: "TIE Fighter"
            threat: 2
            upgrades: [
                "Crack Shot"
                "Afterburners"
                "Shield Upgrade"
            ]
        }
        {
            id: 9
            faction: "Galactic Empire"
            pilot: "Gideon Hask"
            ship: "TIE Fighter"
            threat: 2
            upgrades: [
                "Crack Shot"
                "Shield Upgrade"
            ]
        }
        {
            id: 10
            faction: "Galactic Empire"
            pilot: "Del Meeko"
            ship: "TIE Fighter"
            threat: 2
            upgrades: [
                "Juke"
                "Stealth Device"
            ]
        }
        {
            id: 11
            faction: "Galactic Empire"
            pilot: "Obsidian Squadron Pilot"
            ship: "TIE Fighter"
            threat: 1
            skip: true
        }
        {
            id: 12
            faction: "Galactic Empire"
            pilot: '"Howlrunner"'
            ship: "TIE Fighter"
            threat: 2
            upgrades: [
                "Juke"
                "Shield Upgrade"
            ]
        }
        {
            id: 13
            faction: "Galactic Empire"
            pilot: "Seyn Marana"
            ship: "TIE Fighter"
            threat: 2
            upgrades: [
                "Marksmanship"
                "Afterburners"
            ]
        }
        {
            id: 14
            faction: "Galactic Empire"
            pilot: "Black Squadron Ace"
            suffix: " (x2)"
            linkedId: 14
            ship: "TIE Fighter"
            threat: 3
            upgrades: [
                "Juke"
                "Stealth Device"
            ]
        }
        {
            id: 15
            faction: "Galactic Empire"
            pilot: "Obsidian Squadron Pilot"
            suffix: " (x2)"
            linkedId: 15
            ship: "TIE Fighter"
            threat: 3
            upgrades: [
                "Outmaneuver"
                "Shield Upgrade"
            ]
        }
        {
            id: 16
            faction: "Galactic Empire"
            pilot: "Academy Pilot"
            suffix: " (x2)"
            linkedId: 16
            ship: "TIE Fighter"
            threat: 2
        }
        {
            id: 17
            faction: "Galactic Empire"
            pilot: "Academy Pilot"
            ship: "TIE Fighter"
            threat: 1
            skip: true
        }
        {
            id: 18
            faction: "Galactic Empire"
            pilot: "Darth Vader"
            ship: "TIE Advanced"
            threat: 4
            upgrades: [
                "Supernatural Reflexes"
                "Fire-Control System"
                "Afterburners"
                "Shield Upgrade"
                "Cluster Missiles"
            ]
        }
        {
            id: 19
            faction: "Galactic Empire"
            pilot: "Maarek Stele"
            ship: "TIE Advanced"
            threat: 3
            upgrades: [
                "Ruthless"
                "Fire-Control System"
                "Cluster Missiles"
                "Shield Upgrade"
            ]
        }
        {
            id: 20
            faction: "Galactic Empire"
            pilot: "Storm Squadron Ace"
            ship: "TIE Advanced"
            threat: 2
            upgrades: [
                "Fire-Control System"
            ]
        }
        {
            id: 21
            faction: "Galactic Empire"
            pilot: "Ved Foslo"
            ship: "TIE Advanced"
            threat: 3
            upgrades: [
                "Outmaneuver"
                "Fire-Control System"
                "Cluster Missiles"
                "Shield Upgrade"
            ]
        }
        {
            id: 22
            faction: "Galactic Empire"
            pilot: "Zertik Strom"
            ship: "TIE Advanced"
            threat: 3
            upgrades: [
                "Squad Leader"
                "Fire-Control System"
                "Cluster Missiles"
                "Shield Upgrade"
            ]
        }
        {
            id: 23
            faction: "Galactic Empire"
            pilot: "Tempest Squadron Pilot"
            ship: "TIE Advanced"
            threat: 2
            upgrades: [
                "Cluster Missiles"
            ]
        }
        {
            id: 24
            faction: "Galactic Empire"
            pilot: "Colonel Jendon"
            ship: "Lambda-Class Shuttle"
            threat: 3
            upgrades: [
                "Collision Detector"
                "Ion Cannon"
                "Darth Vader"
                "Freelance Slicer"
                "ST-321"
            ]
        }
        {
            id: 25
            faction: "Galactic Empire"
            pilot: "Captain Kagi"
            ship: "Lambda-Class Shuttle"
            threat: 3
            upgrades: [
                "Collision Detector"
                "Tractor Beam"
                "Emperor Palpatine"
                "Shield Upgrade"
                "Static Discharge Vanes"
            ]
        }
        {
            id: 26
            faction: "Galactic Empire"
            pilot: "Lieutenant Sai"
            ship: "Lambda-Class Shuttle"
            threat: 3
            upgrades: [
                "Ciena Ree"
                'GNK "Gonk" Droid'
                "Advanced Sensors"
                "Jamming Beam"
            ]
        }
        {
            id: 27
            faction: "Galactic Empire"
            pilot: "Omicron Group Pilot"
            ship: "Lambda-Class Shuttle"
            threat: 2
            upgrades: [
                "Admiral Sloane"
                "Jamming Beam"
            ]
        }
        {
            id: 28
            faction: "Galactic Empire"
            pilot: "Lieutenant Kestal"
            ship: "TIE Aggressor"
            threat: 2
            upgrades: [
                "Elusive"
                "Barrage Rockets"
                "Shield Upgrade"
            ]
        }
        {
            id: 29
            faction: "Galactic Empire"
            pilot: "Onyx Squadron Scout"
            ship: "TIE Aggressor"
            threat: 2
            upgrades: [
                "Outmaneuver"
                "Dorsal Turret"
                "Proton Rockets"
            ]
        }
        {
            id: 30
            faction: "Galactic Empire"
            pilot: '"Double Edge"'
            ship: "TIE Aggressor"
            threat: 2
            upgrades: [
                "Ion Cannon Turret"
                "Concussion Missiles"
                "Hotshot Gunner"
            ]
        }
        {
            id: 31
            faction: "Galactic Empire"
            pilot: "Sienar Specialist"
            ship: "TIE Aggressor"
            threat: 2
            upgrades: [
                "Ion Cannon Turret"
                "Homing Missiles"
                "Veteran Turret Gunner"
                "Hull Upgrade"
            ]
        }
        {
            id: 32
            faction: "Galactic Empire"
            pilot: '"Whisper"'
            ship: "TIE Phantom"
            threat: 3
            upgrades: [
                "Juke"
                "Advanced Sensors"
                "Agent Kallus"
                "Stealth Device"
            ]
        }
        {
            id: 33
            faction: "Galactic Empire"
            pilot: "Sigma Squadron Ace"
            ship: "TIE Phantom"
            threat: 3
            upgrades: [
                "Predator"
                "Advanced Sensors"
                "Grand Inquisitor"
            ]
        }
        {
            id: 34
            faction: "Galactic Empire"
            pilot: '"Echo"'
            ship: "TIE Phantom"
            threat: 3
            upgrades: [
                "Lone Wolf"
                "Collision Detector"
                "Perceptive Copilot"
                "Stealth Device"
            ]
        }
        {
            id: 35
            faction: "Galactic Empire"
            pilot: "Imdaar Test Pilot"
            ship: "TIE Phantom"
            threat: 2
            upgrades: [
                "Moff Jerjerrod"
            ]
        }
        {
            id: 36
            faction: "Galactic Empire"
            pilot: '"Duchess"'
            ship: "TIE Striker"
            threat: 2
            upgrades: [
                "Trick Shot"
                "Shield Upgrade"
            ]
        }
        {
            id: 37
            faction: "Galactic Empire"
            pilot: "Black Squadron Scout"
            ship: "TIE Striker"
            threat: 2
            upgrades: [
                "Skilled Bombardier"
                "Proximity Mines"
                "Hull Upgrade"
            ]
        }
        {
            id: 38
            faction: "Galactic Empire"
            pilot: '"Countdown"'
            ship: "TIE Striker"
            threat: 2
            upgrades: [
                "Shield Upgrade"
            ]
        }
        {
            id: 39
            faction: "Galactic Empire"
            pilot: "Planetary Sentinel"
            suffix: " x2"
            linkedId: 39
            ship: "TIE Striker"
            threat: 3
            upgrades: [
                "Conner Nets"
            ]
        }
        {
            id: 40
            faction: "Galactic Empire"
            pilot: '"Pure Sabacc"'
            ship: "TIE Striker"
            threat: 2
            upgrades: [
                "Stealth Device"
            ]
        }
        {
            id: 41
            faction: "Galactic Empire"
            pilot: "Black Squadron Scout"
            ship: "TIE Striker"
            threat: 2
            upgrades: [
                "Skilled Bombardier"
                "Proximity Mines"
                "Hull Upgrade"
            ]
            skip: true
        }
        {
            id: 42
            faction: "Galactic Empire"
            pilot: "Countess Ryad"
            ship: "TIE Defender"
            threat: 4
            upgrades: [
                "Outmaneuver"
                "Afterburners"
            ]
        }
        {
            id: 43
            faction: "Galactic Empire"
            pilot: "Onyx Squadron Ace"
            ship: "TIE Defender"
            threat: 3
        }
        {
            id: 44
            faction: "Galactic Empire"
            pilot: "Rexler Brath"
            ship: "TIE Defender"
            threat: 4
            upgrades: [
                "Juke"
                "Collision Detector"
                "Cluster Missiles"
            ]
        }
        {
            id: 45
            faction: "Galactic Empire"
            pilot: "Colonel Vessery"
            ship: "TIE Defender"
            threat: 4
            upgrades: [
                "Juke"
                "Fire-Control System"
                "Cluster Missiles"
            ]
        }
        {
            id: 46
            faction: "Galactic Empire"
            pilot: "Onyx Squadron Ace"
            ship: "TIE Defender"
            threat: 4
            upgrades: [
                "Elusive"
                "Advanced Sensors"
                "Proton Rockets"
            ]
        }
        {
            id: 47
            faction: "Galactic Empire"
            pilot: "Tomax Bren"
            ship: "TIE Bomber"
            threat: 2
            upgrades: [
                "Crack Shot"
                "Proton Torpedoes"
                "Proton Bombs"
            ]
        }
        {
            id: 48
            faction: "Galactic Empire"
            pilot: '"Deathfire"'
            ship: "TIE Bomber"
            threat: 2
            upgrades: [
                "Cluster Missiles"
                "Skilled Bombardier"
                "Seismic Charges"
                "Proximity Mines"
                "Electronic Baffle"
            ]
        }
        {
            id: 49
            faction: "Galactic Empire"
            pilot: "Major Rhymer"
            ship: "TIE Bomber"
            threat: 2
            upgrades: [
                "Intimidation"
                "Adv. Proton Torpedoes"
                "Cluster Missiles"
            ]
        }
        {
            id: 50
            faction: "Galactic Empire"
            pilot: "Scimitar Squadron Pilot"
            suffix: " x2"
            linkedId: 50
            ship: "TIE Bomber"
            threat: 3
            upgrades: [
                "Ion Missiles"
                "Proton Bombs"
            ]
        }
        {
            id: 51
            faction: "Galactic Empire"
            pilot: "Captain Jonus"
            ship: "TIE Bomber"
            threat: 2
            upgrades: [
                "Proton Torpedoes"
                "Shield Upgrade"
            ]
        }
        {
            id: 52
            faction: "Galactic Empire"
            pilot: "Gamma Squadron Ace"
            ship: "TIE Bomber"
            threat: 2
            upgrades: [
                "Concussion Missiles"
                "Skilled Bombardier"
                "Bomblet Generator"
                "Shield Upgrade"
            ]
        }
        {
            id: 53
            faction: "Galactic Empire"
            pilot: "Grand Inquisitor"
            ship: "TIE Advanced Prototype"
            threat: 3
            upgrades: [
                "Supernatural Reflexes"
                "Concussion Missiles"
            ]
        }
        {
            id: 54
            faction: "Galactic Empire"
            pilot: "Inquisitor"
            ship: "TIE Advanced Prototype"
            threat: 2
            upgrades: [
                "Instinctive Aim"
                "Cluster Missiles"
                "Munitions Failsafe"
            ]
        }
        {
            id: 55
            faction: "Galactic Empire"
            pilot: "Seventh Sister"
            ship: "TIE Advanced Prototype"
            threat: 2
            upgrades: [
                "Homing Missiles"
            ]
        }
        {
            id: 56
            faction: "Galactic Empire"
            pilot: "Baron of the Empire"
            ship: "TIE Advanced Prototype"
            threat: 2
            upgrades: [
                "Crack Shot"
                "Proton Rockets"
                "Stealth Device"
            ]
        }
        {
            id: 57
            faction: "Galactic Empire"
            pilot: "Soontir Fel"
            ship: "TIE Interceptor"
            threat: 3
            upgrades: [
                "Outmaneuver"
                "Afterburners"
                "Stealth Device"
            ]
        }
        {
            id: 58
            faction: "Galactic Empire"
            pilot: "Alpha Squadron Pilot"
            suffix: " x2"
            linkedId: 58
            ship: "TIE Interceptor"
            threat: 3
            upgrades: [
                "Ablative Plating"
            ]
        }
        {
            id: 59
            faction: "Galactic Empire"
            pilot: "Turr Phennir"
            ship: "TIE Interceptor"
            threat: 2
            upgrades: [
                "Daredevil"
                "Electronic Baffle"
            ]
        }
        {
            id: 60
            faction: "Galactic Empire"
            pilot: "Saber Squadron Ace"
            ship: "TIE Interceptor"
            threat: 2
            upgrades: [
                "Predator"
                "Stealth Device"
            ]
        }
        {
            id: 61
            faction: "Galactic Empire"
            pilot: "Lieutenant Karsabi"
            ship: "Alpha-Class Star Wing"
            threat: 2
            upgrades: [
                "Outmaneuver"
                "Heavy Laser Cannon"
                "Advanced SLAM"
                "Xg-1 Assault Configuration"
            ]
        }
        {
            id: 62
            faction: "Galactic Empire"
            pilot: "Nu Squadron Pilot"
            ship: "Alpha-Class Star Wing"
            threat: 2
            upgrades: [
                "Fire-Control System"
                "Proton Torpedoes"
                "Advanced SLAM"
                "Os-1 Arsenal Loadout"
            ]
        }
        {
            id: 63
            faction: "Galactic Empire"
            pilot: "Major Vynder"
            ship: "Alpha-Class Star Wing"
            threat: 2
            upgrades: [
                "Saturation Salvo"
                "Barrage Rockets"
                "Advanced SLAM"
                "Os-1 Arsenal Loadout"
            ]
        }
        {
            id: 64
            faction: "Galactic Empire"
            pilot: "Rho Squadron Pilot"
            ship: "Alpha-Class Star Wing"
            threat: 2
            upgrades: [
                "Fire-Control System"
                "Ion Cannon"
                "Homing Missiles"
                "Advanced SLAM"
                "Xg-1 Assault Configuration"
            ]
        }
        {
            id: 65
            faction: "Galactic Empire"
            pilot: '"Deathrain"'
            ship: "TIE Punisher"
            threat: 2
            upgrades: [
                "Trajectory Simulator"
                "Homing Missiles"
                "Bomblet Generator"
                "Ablative Plating"
            ]
        }
        {
            id: 66
            skip: true
            faction: "Galactic Empire"
            pilot: '"Deathrain"'
            ship: "TIE Punisher"
            threat: 2
            upgrades: [
                "Trajectory Simulator"
                "Homing Missiles"
                "Bomblet Generator"
                "Ablative Plating"
            ]
        }
        {
            id: 67
            faction: "Galactic Empire"
            pilot: "Cutlass Squadron Pilot"
            ship: "TIE Punisher"
            threat: 2
            upgrades: [
                "Trajectory Simulator"
                "Ion Missiles"
                "Skilled Bombardier"
                "Proton Bombs"
            ]
        }
        {
            id: 68
            faction: "Galactic Empire"
            pilot: '"Redline"'
            ship: "TIE Punisher"
            threat: 2
            upgrades: [
                "Debris Gambit"
                "Cluster Missiles"
            ]
        }
        {
            id: 69
            faction: "Galactic Empire"
            pilot: "Cutlass Squadron Pilot"
            ship: "TIE Punisher"
            threat: 2
            upgrades: [
                "Advanced Sensors"
                "Proton Rockets"
                "Conner Nets"
            ]
        }
        {
            id: 70
            faction: "Galactic Empire"
            pilot: "Captain Oicunn"
            ship: "VT-49 Decimator"
            threat: 4
            upgrades: [
                "Intimidation"
                "Grand Moff Tarkin"
                "Dauntless"
            ]
        }
        {
            id: 71
            faction: "Galactic Empire"
            pilot: "Rear Admiral Chiraneau"
            ship: "VT-49 Decimator"
            threat: 4
            upgrades: [
                "Swarm Tactics"
                "Minister Tua"
                "Tactical Officer"
            ]
        }
        {
            id: 72
            faction: "Galactic Empire"
            pilot: "Patrol Leader"
            ship: "VT-49 Decimator"
            threat: 4
            upgrades: [
                "Informant"
                "Seventh Sister"
                "Fifth Brother"
            ]
        }
        {
            id: 73
            faction: "Galactic Empire"
            pilot: '"Vizier"'
            ship: "TIE Reaper"
            threat: 2
            upgrades: [
                "Director Krennic"
            ]
        }
        {
            id: 74
            faction: "Galactic Empire"
            pilot: "Scarif Base Pilot"
            ship: "TIE Reaper"
            threat: 2
            upgrades: [
                "Death Troopers"
                "Shield Upgrade"
            ]
        }
        {
            id: 75
            faction: "Galactic Empire"
            pilot: "Major Vermeil"
            ship: "TIE Reaper"
            threat: 2
            upgrades: [
                "Swarm Tactics"
                "Tactical Officer"
            ]
        }
        {
            id: 76
            faction: "Galactic Empire"
            pilot: "Captain Feroph"
            ship: "TIE Reaper"
            threat: 2
            upgrades: [
                "Swarm Tactics"
                "ISB Slicer"
            ]
        }
        {
            id: 77
            faction: "Rebel Alliance"
            pilot: "Luke Skywalker"
            ship: "X-Wing"
            threat: 3
            upgrades: [
                "Instinctive Aim"
                "Proton Torpedoes"
                "R2-D2"
                "Servomotor S-Foils"
            ]
        }
        {
            id: 78
            faction: "Rebel Alliance"
            pilot: "Red Squadron Veteran"
            ship: "X-Wing"
            threat: 2
            upgrades: [
                "Predator"
                "R5 Astromech"
                "Servomotor S-Foils"
            ]
        }
        {
            id: 79
            faction: "Rebel Alliance"
            pilot: "Jek Porkins"
            ship: "X-Wing"
            threat: 3
            upgrades: [
                "Outmaneuver"
                "R5-D8"
                "Afterburners"
                "Hull Upgrade"
                "Servomotor S-Foils"
            ]
        }
        {
            id: 80
            faction: "Rebel Alliance"
            pilot: "Blue Squadron Escort"
            ship: "X-Wing"
            threat: 2
            upgrades: [
                "Proton Torpedoes"
                "R3 Astromech"
                "Servomotor S-Foils"
            ]
        }
        {
            id: 81
            faction: "Rebel Alliance"
            pilot: "Wedge Antilles"
            ship: "X-Wing"
            threat: 3
            upgrades: [
                "Outmaneuver"
                "Proton Torpedoes"
                "R4 Astromech"
                "Shield Upgrade"
                "Servomotor S-Foils"
            ]
        }
        {
            id: 82
            faction: "Rebel Alliance"
            pilot: "Biggs Darklighter"
            ship: "X-Wing"
            threat: 2
            upgrades: [
                "Selfless"
                "Servomotor S-Foils"
            ]
        }
        {
            id: 83
            faction: "Rebel Alliance"
            pilot: "Thane Kyrell"
            ship: "X-Wing"
            threat: 3
            upgrades: [
                "Elusive"
                "Ion Torpedoes"
                "R2 Astromech"
                "Afterburners"
                "Hull Upgrade"
                "Servomotor S-Foils"
            ]
        }
        {
            id: 84
            faction: "Rebel Alliance"
            pilot: "Garven Dreis (X-Wing)"
            ship: "X-Wing"
            threat: 2
            upgrades: [
                "Servomotor S-Foils"
            ]
        }
        {
            id: 85
            faction: "Rebel Alliance"
            pilot: "Norra Wexley (Y-Wing)"
            ship: "Y-Wing"
            threat: 3
            upgrades: [
                "Expert Handling"
                "Ion Cannon Turret"
                "Veteran Turret Gunner"
                "R3 Astromech"
            ]
        }
        {
            id: 86
            faction: "Rebel Alliance"
            pilot: "Evaan Verlaine"
            ship: "Y-Wing"
            threat: 2
            upgrades: [
                "Expert Handling"
                "Ion Cannon Turret"
            ]
        }
        {
            id: 87
            faction: "Rebel Alliance"
            pilot: "Gold Squadron Veteran"
            ship: "Y-Wing"
            threat: 2
            upgrades: [
                "Expert Handling"
                "Proton Torpedoes"
                "R3 Astromech"
            ]
        }
        {
            id: 88
            faction: "Rebel Alliance"
            pilot: "Horton Salm"
            ship: "Y-Wing"
            threat: 3
            upgrades: [
                "Outmaneuver"
                "Ion Cannon Turret"
                "Veteran Turret Gunner"
                "R5 Astromech"
            ]
        }
        {
            id: 89
            faction: "Rebel Alliance"
            pilot: '"Dutch" Vander'
            ship: "Y-Wing"
            threat: 2
            upgrades: [
                "Proton Torpedoes"
                "R3 Astromech"
            ]
        }
        {
            id: 90
            faction: "Rebel Alliance"
            pilot: "Gray Squadron Bomber"
            ship: "Y-Wing"
            threat: 2
            upgrades: [
                "Ion Cannon Turret"
                "Proton Bombs"
                "R5 Astromech"
            ]
        }
        {
            id: 91
            faction: "Rebel Alliance"
            pilot: "Esege Tuketu"
            ship: "K-Wing"
            threat: 3
            upgrades: [
                "Trajectory Simulator"
                "Ion Missiles"
                "Perceptive Copilot"
                "Conner Nets"
                "Proton Bombs"
                "Advanced SLAM"
            ]
        }
        {
            id: 92
            faction: "Rebel Alliance"
            pilot: "Miranda Doni"
            ship: "K-Wing"
            threat: 2
            upgrades: [
                "Proton Bombs"
                "Advanced SLAM"
            ]
        }
        {
            id: 93
            faction: "Rebel Alliance"
            pilot: "Warden Squadron Pilot"
            ship: "K-Wing"
            threat: 2
            upgrades: [
                "Barrage Rockets"
                "Bomblet Generator"
            ]
        }
        {
            id: 94
            faction: "Rebel Alliance"
            pilot: "Braylen Stramm"
            ship: "B-Wing"
            threat: 2
            upgrades: [
                "Trick Shot"
                "Jamming Beam"
            ]
        }
        {
            id: 95
            faction: "Rebel Alliance"
            pilot: "Blade Squadron Veteran"
            ship: "B-Wing"
            threat: 2
            upgrades: [
                "Elusive"
                "Tractor Beam"
            ]
        }
        {
            id: 96
            faction: "Rebel Alliance"
            pilot: "Ten Numb"
            ship: "B-Wing"
            threat: 3
            upgrades: [
                "Squad Leader"
                "Advanced Sensors"
                "Heavy Laser Cannon"
                "Shield Upgrade"
            ]
        }
        {
            id: 97
            faction: "Rebel Alliance"
            pilot: "Blue Squadron Pilot"
            ship: "B-Wing"
            threat: 2
            upgrades: [
                "Advanced Sensors"
            ]
        }
        {
            id: 98
            faction: "Rebel Alliance"
            pilot: "Norra Wexley"
            ship: "ARC-170"
            threat: 3
            upgrades: [
                "Expert Handling"
                "Seasoned Navigator"
                "Veteran Tail Gunner"
                "R3 Astromech"
                "Ablative Plating"
                "Hull Upgrade"
            ]
        }
        {
            id: 99
            faction: "Rebel Alliance"
            pilot: "Garven Dreis"
            ship: "ARC-170"
            threat: 3
            upgrades: [
                "Expert Handling"
                "Proton Torpedoes"
                "Perceptive Copilot"
                "Veteran Tail Gunner"
            ]
        }
        {
            id: 100
            faction: "Rebel Alliance"
            pilot: "Shara Bey"
            ship: "ARC-170"
            threat: 3
            upgrades: [
                "Expert Handling"
                "Proton Torpedoes"
                "Perceptive Copilot"
                "R3 Astromech"
            ]
        }
        {
            id: 101
            faction: "Rebel Alliance"
            pilot: "Ibtisam"
            ship: "ARC-170"
            threat: 2
            upgrades: [
                "Elusive"
            ]
        }
        {
            id: 102
            faction: "Rebel Alliance"
            pilot: "Wullffwarro"
            ship: "Auzituck Gunship"
            threat: 3
            upgrades: [
                "Selfless"
                'GNK "Gonk" Droid'
                "Novice Technician"
                "Hull Upgrade"
            ]
        }
        {
            id: 103
            faction: "Rebel Alliance"
            pilot: "Lowhhrick"
            ship: "Auzituck Gunship"
            threat: 2
        }
        {
            id: 104
            faction: "Rebel Alliance"
            pilot: "Kashyyyk Defender"
            ship: "Auzituck Gunship"
            threat: 2
            upgrades: [
                "Novice Technician"
            ]
        }
        {
            id: 105
            skip: true
        }
        {
            id: 106
            faction: "Rebel Alliance"
            pilot: "Corran Horn"
            ship: "E-Wing"
            threat: 4
            upgrades: [
                "Outmaneuver"
                "Fire-Control System"
                "Proton Torpedoes"
                "R2 Astromech"
                "Afterburners"
            ]
        }
        {
            id: 107
            faction: "Rebel Alliance"
            pilot: "Rogue Squadron Escort"
            ship: "E-Wing"
            threat: 3
            upgrades: [
                "Predator"
                "Collision Detector"
                "Proton Torpedoes"
                "R3 Astromech"
            ]
        }
        {
            id: 108
            faction: "Rebel Alliance"
            pilot: "Gavin Darklighter"
            ship: "E-Wing"
            threat: 3
            upgrades: [
                "Crack Shot"
                "Fire-Control System"
                "Ion Torpedoes"
                "R4 Astromech"
            ]
        }
        {
            id: 109
            faction: "Rebel Alliance"
            pilot: "Knave Squadron Escort"
            ship: "E-Wing"
            threat: 2
        }
        {
            id: 110
            faction: "Rebel Alliance"
            pilot: "Jan Ors"
            ship: "HWK-290"
            threat: 3
            upgrades: [
                "Trick Shot"
                "Perceptive Copilot"
                "Seismic Charges"
                "Cloaking Device"
                "Engine Upgrade"
                "Moldy Crow"
            ]
        }
        {
            id: 111
            faction: "Rebel Alliance"
            pilot: "Roark Garnet"
            ship: "HWK-290"
            threat: 2
            upgrades: [
                "Elusive"
                "Seismic Charges"
                "Hull Upgrade"
                "Shield Upgrade"
            ]
        }
        {
            id: 112
            faction: "Rebel Alliance"
            pilot: "Kyle Katarn"
            ship: "HWK-290"
            threat: 2
            upgrades: [
                "Moldy Crow"
            ]
        }
        {
            id: 113
            faction: "Rebel Alliance"
            pilot: "Rebel Scout"
            ship: "HWK-290"
            threat: 2
            upgrades: [
                "Proton Bombs"
                "Seismic Charges"
                "Sabine Wren"
                "Engine Upgrade"
            ]
        }
        {
            id: 114
            faction: "Rebel Alliance"
            pilot: "Arvel Crynyd"
            ship: "A-Wing"
            threat: 2
            upgrades: [
                "Intimidation"
                "Proton Rockets"
                "Hull Upgrade"
            ]
        }
        {
            id: 115
            faction: "Rebel Alliance"
            pilot: "Green Squadron Pilot"
            ship: "A-Wing"
            threat: 2
            upgrades: [
                "Daredevil"
                "Concussion Missiles"
                "Shield Upgrade"
            ]
        }
        {
            id: 116
            faction: "Jake Farrell"
            pilot: "Green Squadron Pilot"
            ship: "A-Wing"
            threat: 2
            upgrades: [
                "Outmaneuver"
                "Cluster Missiles"
            ]
        }
        {
            id: 117
            faction: "Rebel Alliance"
            pilot: "Phoenix Squadron Pilot"
            suffix: " x2"
            linkedId: 117
            ship: "A-Wing"
            threat: 3
            upgrades: [
                "Proton Rockets"
            ]
        }
        {
            id: 118
            faction: "Rebel Alliance"
            pilot: "Fenn Rau (Sheathipede)"
            ship: "Sheathipede-Class Shuttle"
            threat: 3
            upgrades: [
                "Outmaneuver"
                "Seasoned Navigator"
                "R4 Astromech"
                "Stealth Device"
                "Phantom"
            ]
        }
        {
            id: 119
            faction: "Rebel Alliance"
            pilot: "Ezra Bridger (Sheathipede)"
            ship: "Sheathipede-Class Shuttle"
            threat: 2
            upgrades: [
                "Heightened Perception"
                '"Chopper" (Astromech)'
                "Afterburners"
                "Phantom"
            ]
        }
        {
            id: 120
            faction: "Rebel Alliance"
            pilot: "Captain Rex"
            ship: "TIE Fighter"
            threat: 2
            upgrades: [
                "Elusive"
                "Juke"
                "Stealth Device"
            ]
        }
        {
            id: 121
            faction: "Rebel Alliance"
            pilot: "Sabine Wren (TIE Fighter)"
            ship: "TIE Fighter"
            threat: 2
            upgrades: [
                "Outmaneuver"
                "Conner Nets"
                "Hull Upgrade"
            ]
        }
        {
            id: 122
            faction: "Rebel Alliance"
            pilot: "Ezra Bridger (TIE Fighter)"
            ship: "TIE Fighter"
            threat: 2
            upgrades: [
                "Supernatural Reflexes"
                '"Zeb" Orrelios'
                "Hull Upgrade"
            ]
        }
        {
            id: 123
            faction: "Rebel Alliance"
            pilot: '"Zeb" Orrelios (TIE Fighter)'
            ship: "TIE Fighter"
            threat: 1
        }
        {
            id: 124
            faction: "Rebel Alliance"
            pilot: "Cassian Andor"
            ship: "U-Wing"
            threat: 3
            upgrades: [
                "Fire-Control System"
                "Jyn Erso"
                "Baze Malbus"
                "Pivot Wing"
            ]
        }
        {
            id: 125
            faction: "Rebel Alliance"
            pilot: "Bodhi Rook"
            ship: "U-Wing"
            threat: 2
            upgrades: [
                "Cassian Andor"
                "Pivot Wing"
            ]
        }
        {
            id: 126
            faction: "Rebel Alliance"
            pilot: "Heff Tobber"
            ship: "U-Wing"
            threat: 3
            upgrades: [
                "Fire-Control System"
                "Ion Cannon Turret"
                "Bistan"
                "Perceptive Copilot"
                "Pivot Wing"
            ]
        }
        {
            id: 127
            faction: "Rebel Alliance"
            pilot: "Blue Squadron Scout"
            ship: "U-Wing"
            threat: 2
            upgrades: [
                "Advanced Sensors"
                "Tactical Officer"
                "Pivot Wing"
            ]
        }
        {
            id: 128
            faction: "Rebel Alliance"
            pilot: "Han Solo"
            ship: "YT-1300"
            threat: 4
            upgrades: [
                "Lone Wolf"
                "Chewbacca"
                "Millennium Falcon"
            ]
        }
        {
            id: 129
            faction: "Rebel Alliance"
            pilot: "Chewbacca"
            ship: "YT-1300"
            threat: 6
            upgrades: [
                "Predator"
                "C-3PO"
                "Leia Organa"
                "R2-D2 (Crew)"
                "Han Solo"
                "Luke Skywalker"
                "Engine Upgrade"
                "Millennium Falcon"
            ]
        }
        {
            id: 130
            faction: "Rebel Alliance"
            pilot: "Lando Calrissian"
            ship: "YT-1300"
            threat: 5
            upgrades: [
                "Swarm Tactics"
                "Concussion Missiles"
                "Nien Nunb"
                "Engine Upgrade"
                "Millennium Falcon"
            ]
        }
        {
            id: 131
            faction: "Rebel Alliance"
            pilot: "Outer Rim Smuggler"
            ship: "YT-1300"
            threat: 4
            upgrades: [
                "Homing Missiles"
                "Novice Technician"
                "Veteran Turret Gunner"
                "Feedback Array"
                "Static Discharge Vanes"
            ]
        }
        {
            id: 132
            faction: "Rebel Alliance"
            pilot: "Airen Cracken"
            ship: "Z-95 Headhunter"
            threat: 2
            upgrades: [
                "Swarm Tactics"
                "Cluster Missiles"
                "Hull Upgrade"
            ]
        }
        {
            id: 133
            faction: "Rebel Alliance"
            pilot: "Bandit Squadron Pilot"
            ship: "Z-95 Headhunter"
            threat: 1
        }
        {
            id: 134
            faction: "Rebel Alliance"
            pilot: "Lieutenant Blount"
            ship: "Z-95 Headhunter"
            threat: 2
            upgrades: [
                "Outmaneuver"
                "Proton Rockets"
                "Shield Upgrade"
            ]
        }
        {
            id: 135
            faction: "Rebel Alliance"
            pilot: "Tala Squadron Pilot"
            ship: "Z-95 Headhunter"
            threat: 1
            upgrades: [
                "Selfless"
            ]
        }
        {
            id: 136
            faction: "Rebel Alliance"
            pilot: "Hera Syndulla"
            ship: "Attack Shuttle"
            threat: 2
            upgrades: [
                "Elusive"
                "Ion Cannon Turret"
                "Phantom"
            ]
        }
        {
            id: 137
            faction: "Rebel Alliance"
            pilot: "Sabine Wren"
            ship: "Attack Shuttle"
            threat: 2
            upgrades: [
                "Outmaneuver"
                "Dorsal Turret"
                "Phantom"
            ]
        }
        {
            id: 138
            faction: "Rebel Alliance"
            pilot: "Dash Rendar"
            ship: "YT-2400"
            threat: 5
            upgrades: [
                "Expert Handling"
                "Trick Shot"
                "Perceptive Copilot"
                "Rigged Cargo Chute"
                "Outrider"
            ]
        }
        {
            id: 139
            faction: "Rebel Alliance"
            pilot: '"Leebo"'
            ship: "YT-2400"
            threat: 4
            upgrades: [
                "Outrider"
                "Inertial Dampeners"
            ]
        }
        {
            id: 140
            faction: "Rebel Alliance"
            pilot: "Wild Space Fringer"
            ship: "YT-2400"
            threat: 4
            upgrades: [
                "Concussion Missiles"
                "Veteran Turret Gunner"
                "Contraband Cybernetics"
            ]
        }
        {
            id: 141
            faction: "Rebel Alliance"
            pilot: "Magva Yarro"
            ship: "U-Wing"
            threat: 3
            upgrades: [
                "Elusive"
                "Saw Gerrera"
                "Advanced Sensors"
                "Shield Upgrade"
                "Pivot Wing"
            ]
        }
        {
            id: 142
            faction: "Rebel Alliance"
            pilot: "Saw Gerrera"
            ship: "U-Wing"
            threat: 2
            upgrades: [
                "Magva Yarro"
                "Pivot Wing"
            ]
        }
        {
            id: 143
            faction: "Rebel Alliance"
            pilot: "Benthic Two Tubes"
            ship: "U-Wing"
            threat: 2
            upgrades: [
                "Advanced Sensors"
                "Pivot Wing"
            ]
        }
        {
            id: 144
            faction: "Rebel Alliance"
            pilot: "Partisan Renegade"
            ship: "U-Wing"
            threat: 2
            upgrades: [
                "Advanced Sensors"
                "Deadman's Switch"
                "Pivot Wing"
            ]
        }
        {
            id: 145
            faction: "Rebel Alliance"
            pilot: "Kullbee Sperado"
            ship: "X-Wing"
            threat: 3
            upgrades: [
                "Outmaneuver"
                "R2 Astromech"
                "Deadman's Switch"
                "Afterburners"
                "Hull Upgrade"
                "Servomotor S-Foils"
            ]
        }
        {
            id: 146
            faction: "Rebel Alliance"
            pilot: "Edrio Two Tubes"
            ship: "X-Wing"
            threat: 2
            upgrades: [
                "Trick Shot"
                "R4 Astromech"
                "Deadman's Switch"
                "Servomotor S-Foils"
            ]
        }
        {
            id: 147
            faction: "Rebel Alliance"
            pilot: "Leevan Tenza"
            ship: "X-Wing"
            threat: 3
            upgrades: [
                "Elusive"
                "R2 Astromech"
                "Deadman's Switch"
                "Afterburners"
                "Shield Upgrade"
                "Servomotor S-Foils"
            ]
        }
        {
            id: 148
            faction: "Rebel Alliance"
            pilot: "Cavern Angels Zealot"
            ship: "X-Wing"
            threat: 2
            upgrades: [
                "R2 Astromech"
                "Deadman's Switch"
                "Servomotor S-Foils"
            ]
        }
        {
            id: 149
            faction: "Rebel Alliance"
            pilot: "Kanan Jarrus"
            suffix: " + Phantom"
            linkedId: 150
            ship: "VCX-100"
            threat: 6
            upgrades: [
                "Ion Cannon Turret"
                "Hera Syndulla"
                '"Chopper" (Crew)'
                "Ezra Bridger"
                "Ghost"
            ]
        }
        {
            id: 150
            faction: "Rebel Alliance"
            pilot: '"Zeb" Orrelios'
            suffix: " + Ghost"
            linkedId: 149
            ship: "Attack Shuttle"
            threat: 6
            upgrades: [
                "Phantom"
            ]
        }
        {
            id: 151
            faction: "Rebel Alliance"
            pilot: "Hera Syndulla (VCX-100)"
            suffix: " + Phantom"
            linkedId: 152
            ship: "VCX-100"
            threat: 6
            upgrades: [
                "Elusive"
                "Dorsal Turret"
                "Kanan Jarrus"
                "Ghost"
            ]
        }
        {
            id: 152
            faction: "Rebel Alliance"
            pilot: "Ezra Bridger"
            suffix: " + Ghost"
            linkedId: 151
            ship: "Attack Shuttle"
            threat: 6
            upgrades: [
                "Supernatural Reflexes"
                "Dorsal Turret"
                "Phantom"
            ]
        }
        {
            id: 153
            faction: "Rebel Alliance"
            pilot: '"Chopper"'
            suffix: " + Phantom"
            linkedId: 154
            ship: "VCX-100"
            threat: 6
            upgrades: [
                "Ion Cannon Turret"
                '"Zeb" Orrelios'
                "Ghost"
            ]
        }
        {
            id: 154
            faction: "Rebel Alliance"
            pilot: "AP-5"
            suffix: " + Ghost"
            linkedId: 153
            ship: "Sheathipede-Class Shuttle"
            threat: 6
            upgrades: [
                "R4 Astromech"
                "Phantom"
            ]
        }
        {
            id: 155
            faction: "Rebel Alliance"
            pilot: "Lothal Rebel"
            suffix: " + Phantom"
            linkedId: 156
            ship: "VCX-100"
            threat: 4
            upgrades: [
                "Dorsal Turret"
                "Lando Calrissian"
                "Ghost"
            ]
        }
        {
            id: 156
            faction: "Rebel Alliance"
            pilot: '"Zeb" Orrelios (Sheathipede)'
            suffix: " + Ghost"
            linkedId: 155
            ship: "Sheathipede-Class Shuttle"
            threat: 4
            upgrades: [
                "R5 Astromech"
                "Phantom"
            ]
        }
        {
            id: 157
            faction: "First Order"
            pilot: '"Midnight"'
            ship: "TIE/FO Fighter"
            threat: 2
            upgrades: [
                "Afterburners"
            ]
        }
        {
            id: 158
            faction: "First Order"
            pilot: '"Static"'
            ship: "TIE/FO Fighter"
            threat: 2
            upgrades: [
                "Outmaneuver"
            ]
        }
        {
            id: 159
            faction: "First Order"
            pilot: "Omega Squadron Ace"
            ship: "TIE/FO Fighter"
            threat: 2
            upgrades: [
                "Elusive"
                "Fanatical"
                "Hull Upgrade"
            ]
        }
        {
            id: 160
            faction: "First Order"
            pilot: '"Scorch"'
            ship: "TIE/FO Fighter"
            threat: 2
            upgrades: [
                "Fanatical"
                "Hull Upgrade"
            ]
        }
        {
            id: 161
            faction: "First Order"
            pilot: '"Longshot"'
            ship: "TIE/FO Fighter"
            threat: 2
            upgrades: [
                "Elusive"
                "Predator"
            ]
        }
        {
            id: 162
            faction: "First Order"
            pilot: "Zeta Squadron Pilot"
            ship: "TIE/FO Fighter"
            threat: 2
            upgrades: [
                "Advanced Optics"
                "Shield Upgrade"
            ]
        }
        {
            id: 163
            faction: "First Order"
            pilot: '"Muse"'
            ship: "TIE/FO Fighter"
            threat: 2
            upgrades: [
                "Squad Leader"
                "Advanced Optics"
            ]
        }
        {
            id: 164
            faction: "First Order"
            pilot: '"Null"'
            ship: "TIE/FO Fighter"
            threat: 2
            upgrades: [
                "Swarm Tactics"
                "Afterburners"
                "Shield Upgrade"
            ]
        }
        {
            id: 165
            faction: "First Order"
            pilot: "Epsilon Squadron Cadet"
            ship: "TIE/FO Fighter"
            threat: 2
            upgrades: [
                "Targeting Synchronizer"
                "Afterburners"
            ]
        }
        {
            id: 166
            faction: "First Order"
            pilot: "Commander Malarus"
            ship: "TIE/FO Fighter"
            threat: 2
            upgrades: [
                "Advanced Optics"
            ]
        }
        {
            id: 167
            faction: "First Order"
            pilot: "TN-3465"
            ship: "TIE/FO Fighter"
            threat: 2
            upgrades: [
                "Targeting Synchronizer"
                "Shield Upgrade"
            ]
        }
        {
            id: 168
            faction: "First Order"
            pilot: "Lieutenant Rivas"
            ship: "TIE/FO Fighter"
            threat: 1
            upgrades: [
            ]
        }
        {
            id: 169
            faction: "First Order"
            pilot: '"Quickdraw"'
            ship: "TIE/SF Fighter"
            threat: 3
            upgrades: [
                "Juke"
                "Collision Detector"
                "Hotshot Gunner"
                "Afterburners"
                "Shield Upgrade"
            ]
        }
        {
            id: 170
            faction: "First Order"
            pilot: "Zeta Squadron Survivor"
            ship: "TIE/SF Fighter"
            threat: 2
            upgrades: [
                "Pattern Analyzer"
                "Ion Missiles"
                "Special Forces Gunner"
            ]
        }
        {
            id: 171
            faction: "First Order"
            pilot: '"Backdraft"'
            ship: "TIE/SF Fighter"
            threat: 3
            upgrades: [
                "Pattern Analyzer"
                "Collision Detector"
                "Ion Missiles"
                "Special Forces Gunner"
                "Shield Upgrade"
            ]
        }
        {
            id: 172
            faction: "First Order"
            pilot: "Omega Squadron Expert"
            ship: "TIE/SF Fighter"
            threat: 2
            upgrades: [
                "Juke"
                "Special Forces Gunner"
            ]
        }
        {
            id: 173
            faction: "First Order"
            pilot: "Kylo Ren"
            ship: "TIE/VN Silencer"
            threat: 4
            upgrades: [
                "Hate"
                "Predictive Shot"
                "Primed Thrusters"
                "Adv. Proton Torpedoes"
            ]
        }
        {
            id: 174
            faction: "First Order"
            pilot: '"Recoil"'
            ship: "TIE/VN Silencer"
            threat: 3
            upgrades: [
                "Predator"
                "Proton Torpedoes"
            ]
        }
        {
            id: 175
            faction: "First Order"
            pilot: "First Order Test Pilot"
            ship: "TIE/VN Silencer"
            threat: 3
            upgrades: [
                "Outmaneuver"
                "Hull Upgrade"
            ]
        }
        {
            id: 176
            faction: "First Order"
            pilot: '"Blackout"'
            ship: "TIE/VN Silencer"
            threat: 3
            upgrades: [
                "Elusive"
                "Afterburners"
            ]
        }
        {
            id: 177
            faction: "First Order"
            pilot: '"Avenger"'
            ship: "TIE/VN Silencer"
            threat: 3
            upgrades: [
                "Primed Thrusters"
                "Adv. Proton Torpedoes"
            ]
        }
        {
            id: 178
            faction: "First Order"
            pilot: "Sienar-Jaemus Engineer"
            ship: "TIE/VN Silencer"
            threat: 2
        }
        {
            id: 179
            faction: "First Order"
            pilot: "Lieutenant Tavson"
            ship: "Upsilon-Class Command Shuttle"
            threat: 4
            upgrades: [
                "Advanced Sensors"
                "Ion Cannon"
                "Kylo Ren"
                "Supreme Leader Snoke"
                "Shield Upgrade"
            ]
        }
        {
            id: 180
            faction: "First Order"
            pilot: "Lieutenant Dormitz"
            ship: "Upsilon-Class Command Shuttle"
            threat: 3
            upgrades: [
                "Biohexacrypt Codes"
                "Hyperspace Tracking Data"
                "Tractor Beam"
            ]
        }
        {
            id: 181
            faction: "First Order"
            pilot: "Starkiller Base Pilot"
            ship: "Upsilon-Class Command Shuttle"
            threat: 2
        }
        {
            id: 182
            faction: "First Order"
            pilot: "Major Stridan"
            ship: "Upsilon-Class Command Shuttle"
            threat: 4
            upgrades: [
                "Biohexacrypt Codes"
                "Pattern Analyzer"
                "Tractor Beam"
                "Captain Phasma"
                "General Hux"
            ]
        }
        {
            id: 183
            faction: "First Order"
            pilot: "Captain Cardinal"
            ship: "Upsilon-Class Command Shuttle"
            threat: 3
            upgrades: [
                "Ion Cannon"
                "Petty Officer Thanisson"
            ]
        }
        {
            id: 184
            faction: "First Order"
            pilot: "Petty Officer Thanisson"
            ship: "Upsilon-Class Command Shuttle"
            threat: 3
            upgrades: [
                "Captain Phasma"
                "Tactical Scrambler"
            ]
        }
        {
            id: 185
            faction: "Scum and Villainy"
            pilot: "Boba Fett"
            ship: "Firespray-31"
            threat: 4
            upgrades: [
                "Lone Wolf"
                "Perceptive Copilot"
                "Inertial Dampeners"
                "Seismic Charges"
                "Slave I"
            ]
        }
        {
            id: 186
            faction: "Scum and Villainy"
            pilot: "Kath Scarlet"
            ship: "Firespray-31"
            threat: 3
            upgrades: [
                "Marauder"
            ]
        }
        {
            id: 187
            faction: "Scum and Villainy"
            pilot: "Krassis Trelix"
            ship: "Firespray-31"
            threat: 3
            upgrades: [
                "Concussion Missiles"
            ]
        }
        {
            id: 188
            faction: "Scum and Villainy"
            pilot: "Emon Azzameen"
            ship: "Firespray-31"
            threat: 4
            upgrades: [
                "Elusive"
                "Perceptive Copilot"
                "Inertial Dampeners"
                "Proximity Mines"
                "Seismic Charges"
                "Andrasta"
            ]
        }
        {
            id: 189
            faction: "Scum and Villainy"
            pilot: "Koshka Frost"
            ship: "Firespray-31"
            threat: 3
            upgrades: [
                "Perceptive Copilot"
            ]
        }
        {
            id: 190
            faction: "Scum and Villainy"
            pilot: "Bounty Hunter"
            ship: "Firespray-31"
            threat: 3
            upgrades: [
                "Perceptive Copilot"
                "Inertial Dampeners"
                "Seismic Charges"
            ]
        }
        {
            id: 191
            faction: "Scum and Villainy"
            pilot: "Fenn Rau"
            ship: "Fang Fighter"
            threat: 3
            upgrades: [
                "Daredevil"
                "Afterburners"
                "Hull Upgrade"
            ]
        }
        {
            id: 192
            faction: "Scum and Villainy"
            pilot: "Kad Solus"
            ship: "Fang Fighter"
            threat: 2
            upgrades: [
                "Fearless"
            ]
        }
        {
            id: 193
            faction: "Scum and Villainy"
            pilot: "Zealous Recruit"
            ship: "Fang Fighter"
            threat: 2
            upgrades: [
                "Proton Torpedoes"
            ]
        }
        {
            id: 194
            faction: "Scum and Villainy"
            pilot: "Joy Rekkoff"
            ship: "Fang Fighter"
            threat: 3
            upgrades: [
                "Predator"
                "Ion Torpedoes"
                "Afterburners"
                "Hull Upgrade"
            ]
        }
        {
            id: 195
            faction: "Scum and Villainy"
            pilot: "Old Teroch"
            ship: "Fang Fighter"
            threat: 2
        }
        {
            id: 196
            faction: "Scum and Villainy"
            pilot: "Skull Squadron Pilot"
            ship: "Fang Fighter"
            threat: 2
            upgrades: [
                "Fearless"
            ]
        }
        {
            id: 197
            faction: "Scum and Villainy"
            pilot: "Ahhav"
            ship: "Mining Guild TIE Fighter"
            threat: 2
            upgrades: [
                "Elusive"
                "Afterburners"
                "Hull Upgrade"
            ]
        }
        {
            id: 198
            faction: "Scum and Villainy"
            pilot: "Mining Guild Surveyor"
            ship: "Mining Guild TIE Fighter"
            threat: 2
            upgrades: [
                "Swarm Tactics"
                "Trick Shot"
                "Shield Upgrade"
                "Static Discharge Vanes"
            ]
        }
        {
            id: 199
            faction: "Scum and Villainy"
            pilot: "Overseer Yushyn"
            ship: "Mining Guild TIE Fighter"
            threat: 1
        }
        {
            id: 200
            faction: "Scum and Villainy"
            pilot: "Captain Seevor"
            ship: "Mining Guild TIE Fighter"
            threat: 2
            upgrades: [
                "Outmaneuver"
                "Shield Upgrade"
            ]
        }
        {
            id: 201
            faction: "Scum and Villainy"
            pilot: "Foreman Proach"
            ship: "Mining Guild TIE Fighter"
            threat: 2
            upgrades: [
                "Predator"
                "Swarm Tactics"
                "Hull Upgrade"
            ]
        }
        {
            id: 202
            faction: "Scum and Villainy"
            pilot: "Mining Guild Sentry"
            ship: "Mining Guild TIE Fighter"
            threat: 1
        }
        {
            id: 203
            faction: "Scum and Villainy"
            pilot: "Ketsu Onyo"
            ship: "Lancer-Class Pursuit Craft"
            threat: 4
            upgrades: [
                "Outmaneuver"
                "Rigged Cargo Chute"
                "Shield Upgrade"
                "Shadow Caster"
            ]
        }
        {
            id: 204
            faction: "Scum and Villainy"
            pilot: "Sabine Wren (Scum)"
            ship: "Lancer-Class Pursuit Craft"
            threat: 3
            upgrades: [
                "Fearless"
                "Ketsu Onyo"
                "Shadow Caster"
            ]
        }
        {
            id: 205
            faction: "Scum and Villainy"
            pilot: "Asajj Ventress"
            ship: "Lancer-Class Pursuit Craft"
            threat: 4
            upgrades: [
                "Sense"
                "Veteran Turret Gunner"
                "Deadman's Switch"
                "Inertial Dampeners"
            ]
        }
        {
            id: 206
            faction: "Scum and Villainy"
            pilot: "Shadowport Hunter"
            ship: "Lancer-Class Pursuit Craft"
            threat: 3
            upgrades: [
                "Maul"
                "Contraband Cybernetics"
            ]
        }
        {
            id: 207
            faction: "Scum and Villainy"
            pilot: "Talonbane Cobra"
            ship: "Kihraxz Fighter"
            threat: 3
            upgrades: [
                "Outmaneuver"
                "Cluster Missiles"
                "Inertial Dampeners"
                "Afterburners"
                "Electronic Baffle"
                "Shield Upgrade"
            ]
        }
        {
            id: 208
            faction: "Scum and Villainy"
            pilot: "Viktor Hel"
            ship: "Kihraxz Fighter"
            threat: 2
            upgrades: [
                "Crack Shot"
                "Stealth Device"
            ]
        }
        {
            id: 209
            faction: "Scum and Villainy"
            pilot: "Graz"
            ship: "Kihraxz Fighter"
            threat: 3
            upgrades: [
                "Outmaneuver"
                "Concussion Missiles"
                "Contraband Cybernetics"
                "Afterburners"
            ]
        }
        {
            id: 210
            faction: "Scum and Villainy"
            pilot: "Black Sun Ace"
            ship: "Kihraxz Fighter"
            threat: 2
            upgrades: [
                "Predator"
                "Shield Upgrade"
            ]
        }
        {
            id: 211
            faction: "Scum and Villainy"
            pilot: "Captain Jostero"
            ship: "Kihraxz Fighter"
            threat: 2
            upgrades: [
                "Ion Missiles"
                "Munitions Failsafe"
            ]
        }
        {
            id: 212
            faction: "Scum and Villainy"
            pilot: "Cartel Marauder"
            ship: "Kihraxz Fighter"
            threat: 2
            upgrades: [
                "Concussion Missiles"
                "Hull Upgrade"
                "Munitions Failsafe"
            ]
        }
        {
            id: 213
            faction: "Scum and Villainy"
            pilot: "Kavil"
            ship: "Y-Wing"
            threat: 3
            upgrades: [
                "Expert Handling"
                "Dorsal Turret"
                '"Genius"'
                "Proton Bombs"
                "Afterburners"
            ]
        }
        {
            id: 214
            faction: "Scum and Villainy"
            pilot: "Hired Gun"
            ship: "Y-Wing"
            threat: 2
            upgrades: [
                "Crack Shot"
                "Ion Cannon Turret"
                "Veteran Turret Gunner"
                "R3 Astromech"
                "Conner Nets"
            ]
        }
        {
            id: 215
            faction: "Scum and Villainy"
            pilot: "Drea Renthal"
            ship: "Y-Wing"
            threat: 2
            upgrades: [
                "Expert Handling"
                "Ion Cannon Turret"
                "Hotshot Gunner"
            ]
        }
        {
            id: 216
            faction: "Scum and Villainy"
            pilot: "Crymorah Goon"
            ship: "Y-Wing"
            threat: 2
            upgrades: [
                "Dorsal Turret"
                "Ion Torpedoes"
                "R3 Astromech"
                "Inertial Dampeners"
                "Proximity Mines"
            ]
        }
        {
            id: 217
            faction: "Scum and Villainy"
            pilot: "Dace Bonearm"
            ship: "HWK-290"
            threat: 2
            upgrades: [
                "Feedback Array"
                "Conner Nets"
                "Static Discharge Vanes"
            ]
        }
        {
            id: 218
            faction: "Scum and Villainy"
            pilot: "Palob Godalhi"
            ship: "HWK-290"
            threat: 2
            upgrades: [
                "Debris Gambit"
                "Juke"
                "Contraband Cybernetics"
                "Stealth Device"
            ]
        }
        {
            id: 219
            faction: "Scum and Villainy"
            pilot: "Torkil Mux"
            ship: "HWK-290"
            threat: 2
            upgrades: [
                "Cloaking Device"
                "Proximity Mines"
            ]
        }
        {
            id: 220
            faction: "Scum and Villainy"
            pilot: "Spice Runner"
            suffix: " (x2)"
            ship: "HWK-290"
            threat: 3
            linkedId: 220
            upgrades: [
                "Deadman's Switch"
                "Proton Bombs"
                "Electronic Baffle"
            ]
        }
        {
            id: 221
            faction: "Scum and Villainy"
            pilot: "Constable Zuvio"
            ship: "Quadjumper"
            threat: 2
            upgrades: [
                "Outmaneuver"
                "Rigged Cargo Chute"
                "Conner Nets"
                "Shield Upgrade"
            ]
        }
        {
            id: 222
            faction: "Scum and Villainy"
            pilot: "Jakku Gunrunner"
            suffix: " (x2)"
            linkedId: 222
            ship: "Quadjumper"
            threat: 3
            upgrades: [
                "Novice Technician"
                "Proximity Mines"
                "Electronic Baffle"
            ]
        }
        {
            id: 223
            faction: "Scum and Villainy"
            pilot: "Sarco Plank"
            ship: "Quadjumper"
            threat: 2
            upgrades: [
                "Unkar Plutt"
                "Feedback Array"
                "Seismic Charges"
                "Hull Upgrade"
                "Shield Upgrade"
            ]
        }
        {
            id: 224
            faction: "Scum and Villainy"
            pilot: "Unkar Plutt"
            ship: "Quadjumper"
            threat: 2
            upgrades: [
                "Novice Technician"
                "Contraband Cybernetics"
                "Proximity Mines"
                "Afterburners"
            ]
        }
        {
            id: 225
            faction: "Scum and Villainy"
            pilot: "Prince Xizor"
            ship: "StarViper"
            threat: 3
            upgrades: [
                "Predator"
                "Fire-Control System"
                "Shield Upgrade"
                "Virago"
            ]
        }
        {
            id: 226
            faction: "Scum and Villainy"
            pilot: "Black Sun Enforcer"
            ship: "StarViper"
            threat: 2
            upgrades: [
                "Collision Detector"
            ]
        }
        {
            id: 227
            faction: "Scum and Villainy"
            pilot: "Guri"
            ship: "StarViper"
            threat: 3
            upgrades: [
                "Daredevil"
                "Advanced Sensors"
                "Adv. Proton Torpedoes"
            ]
        }
        {
            id: 228
            faction: "Scum and Villainy"
            pilot: "Dalan Oberos (StarViper)"
            ship: "StarViper"
            threat: 3
            upgrades: [
                "Outmaneuver"
                "Fire-Control System"
                "Proton Torpedoes"
                "Contraband Cybernetics"
            ]
        }
        {
            id: 229
            faction: "Scum and Villainy"
            pilot: "Black Sun Assassin"
            ship: "StarViper"
            threat: 2
            upgrades: [
                "Fearless"
            ]
        }
        {
            id: 230
            faction: "Scum and Villainy"
            pilot: "Serissu"
            ship: "M3-A Interceptor"
            threat: 2
            upgrades: [
                "Stealth Device"
            ]
        }
        {
            id: 231
            faction: "Scum and Villainy"
            pilot: "Genesis Red"
            ship: "M3-A Interceptor"
            threat: 2
            upgrades: [
                "Juke"
                "Concussion Missiles"
                "Munitions Failsafe"
            ]
        }
        {
            id: 232
            faction: "Scum and Villainy"
            pilot: "Quinn Jast"
            ship: "M3-A Interceptor"
            threat: 2
            upgrades: [
                "Crack Shot"
                "Adv. Proton Torpedoes"
                "Afterburners"
            ]
        }
        {
            id: 233
            faction: "Scum and Villainy"
            pilot: "Laetin A'shera"
            ship: "M3-A Interceptor"
            threat: 2
            upgrades: [
                "Juke"
                "Cluster Missiles"
                "Munitions Failsafe"
                "Stealth Device"
            ]
        }
        {
            id: 234
            faction: "Scum and Villainy"
            pilot: "Inaldra"
            ship: "M3-A Interceptor"
            threat: 2
            upgrades: [
                "Ion Cannon"
                "Hull Upgrade"
                "Shield Upgrade"
            ]
        }
        {
            id: 235
            faction: "Scum and Villainy"
            pilot: "Tansarii Point Veteran"
            suffix: " (x2)"
            linkedId: 235
            ship: "M3-A Interceptor"
            threat: 3
            upgrades: [
                "Crack Shot"
                "Heavy Laser Cannon"
            ]
        }
        {
            id: 236
            faction: "Scum and Villainy"
            pilot: "Sunny Bounder"
            ship: "M3-A Interceptor"
            threat: 2
            upgrades: [
                "Predator"
                "Cluster Missiles"
                "Afterburners"
            ]
        }
        {
            id: 237
            faction: "Scum and Villainy"
            pilot: "Cartel Spacer"
            suffix: " (x2)"
            linkedId: 237
            ship: "M3-A Interceptor"
            threat: 3
            upgrades: [
                "Ion Torpedoes"
                "Munitions Failsafe"
            ]
        }
        {
            id: 238
            faction: "Scum and Villainy"
            pilot: "Tel Trevura"
            ship: "JumpMaster 5000"
            threat: 3
            upgrades: [
                "Expert Handling"
                'GNK "Gonk" Droid'
                "Proton Torpedoes"
                "Deadman's Switch"
            ]
        }
        {
            id: 239
            faction: "Scum and Villainy"
            pilot: "Contracted Scout"
            ship: "JumpMaster 5000"
            threat: 2
            upgrades: [
                "Ion Torpedoes"
                "Inertial Dampeners"
            ]
        }
        {
            id: 240
            faction: "Scum and Villainy"
            pilot: "Dengar"
            ship: "JumpMaster 5000"
            threat: 3
            upgrades: [
                "Expert Handling"
                "Proton Torpedoes"
                "R4 Astromech"
                "Contraband Cybernetics"
                "Punishing One"
            ]
        }
        {
            id: 241
            faction: "Scum and Villainy"
            pilot: "Manaroo"
            ship: "JumpMaster 5000"
            threat: 3
            upgrades: [
                "Intimidation"
                "Perceptive Copilot"
                "Proton Torpedoes"
                "Feedback Array"
                "Static Discharge Vanes"
            ]
        }
        {
            id: 242
            faction: "Scum and Villainy"
            pilot: "N'dru Suhlak"
            ship: "Z-95 Headhunter"
            threat: 2
            upgrades: [
                "Lone Wolf"
                "Homing Missiles"
                "Cloaking Device"
                "Hull Upgrade"
            ]
        }
        {
            id: 243
            faction: "Scum and Villainy"
            pilot: "Black Sun Soldier"
            suffix: " (x2)"
            linkedId: 243
            ship: "Z-95 Headhunter"
            threat: 3
            upgrades: [
                "Expert Handling"
                "Concussion Missiles"
                "Deadman's Switch"
                "Hull Upgrade"
            ]
        }
        {
            id: 244
            faction: "Scum and Villainy"
            pilot: "Kaa'to Leeachos"
            ship: "Z-95 Headhunter"
            threat: 2
            upgrades: [
                "Expert Handling"
                "Cluster Missiles"
                "Contraband Cybernetics"
                "Afterburners"
            ]
        }
        {
            id: 245
            faction: "Scum and Villainy"
            pilot: "Binayre Pirate"
            ship: "Z-95 Headhunter"
            threat: 1
        }
        {
            id: 246
            faction: "Scum and Villainy"
            pilot: "4-LOM"
            ship: "G-1A Starfighter"
            threat: 3
            upgrades: [
                "Elusive"
                "Advanced Sensors"
                "0-0-0"
                "Zuckuss"
                "BT-1"
                "Mist Hunter"
            ]
        }
        {
            id: 247
            faction: "Scum and Villainy"
            pilot: "Zuckuss"
            ship: "G-1A Starfighter"
            threat: 2
            upgrades: [
                "Lone Wolf"
                "Tractor Beam"
                "4-LOM"
                "Mist Hunter"
            ]
        }
        {
            id: 248
            faction: "Scum and Villainy"
            pilot: "Gand Findsman"
            ship: "G-1A Starfighter"
            threat: 2
            upgrades: [
                "Fire-Control System"
                "Freelance Slicer"
                "Deadman's Switch"
                "Electronic Baffle"
            ]
        }
        {
            id: 249
            faction: "Scum and Villainy"
            pilot: "Moralo Eval"
            ship: "YV-666"
            threat: 4
            upgrades: [
                "Outmaneuver"
                "Cluster Missiles"
                "Latts Razzi"
                "Dengar"
                "Contraband Cybernetics"
            ]
        }
        {
            id: 250
            faction: "Scum and Villainy"
            pilot: "Latts Razzi"
            ship: "YV-666"
            threat: 3
            upgrades: [
                "Boba Fett"
                "Bossk"
                "Dengar"
                "Feedback Array"
                "Static Discharge Vanes"
            ]
        }
        {
            id: 251
            faction: "Scum and Villainy"
            pilot: "Trandoshan Slaver"
            ship: "YV-666"
            threat: 3
            upgrades: [
                "Hotshot Gunner"
                "Jabba the Hutt"
                "Contraband Cybernetics"
                "Rigged Cargo Chute"
            ]
        }
        {
            id: 252
            faction: "Scum and Villainy"
            pilot: "Bossk"
            suffix: " + Nashtah Pup"
            linkedId: 253
            ship: "YV-666"
            threat: 3
            upgrades: [
                "Marksmanship"
                "Greedo"
                "Hound's Tooth"
            ]
        }
        {
            id: 253
            faction: "Scum and Villainy"
            pilot: "Nashtah Pup"
            suffix: " + Bossk"
            linkedId: 252
            ship: "Z-95 Headhunter"
            threat: 3
        }
        {
            id: 254
            faction: "Scum and Villainy"
            pilot: "Trandoshan Slaver"
            suffix: " + Nashtah Pup"
            linkedId: 255
            ship: "YV-666"
            threat: 3
            upgrades: [
                "Deadman's Switch"
                "Hound's Tooth"
            ]
        }
        {
            id: 255
            faction: "Scum and Villainy"
            pilot: "Nashtah Pup"
            suffix: " + Trandoshan Slaver"
            linkedId: 254
            ship: "Z-95 Headhunter"
            threat: 3
            upgrades: [
                "Proton Rockets"
            ]
        }
        {
            id: 256
            faction: "Scum and Villainy"
            pilot: "Torani Kulda"
            ship: "M12-L Kimogila Fighter"
            threat: 3
            upgrades: [
                "Saturation Salvo"
                "Proton Torpedoes"
                "Cluster Missiles"
                "R4 Astromech"
                "Inertial Dampeners"
                "Shield Upgrade"
            ]
        }
        {
            id: 257
            faction: "Scum and Villainy"
            pilot: "Dalan Oberos"
            ship: "M12-L Kimogila Fighter"
            threat: 2
            upgrades: [
                "Expert Handling"
                "R5-TK"
                "Inertial Dampeners"
            ]
        }
        {
            id: 258
            faction: "Scum and Villainy"
            pilot: "Cartel Executioner"
            ship: "M12-L Kimogila Fighter"
            threat: 2
            upgrades: [
                "Crack Shot"
                "R5-P8"
                "Contraband Cybernetics"
            ]
        }
        {
            id: 259
            skip: true
            faction: "Scum and Villainy"
            pilot: "Dalan Oberos"
            ship: "M12-L Kimogila Fighter"
            threat: 2
            upgrades: [
                "Expert Handling"
                "R5-TK"
                "Inertial Dampeners"
            ]
        }
        {
            id: 260
            faction: "Scum and Villainy"
            pilot: "Captain Nym"
            ship: "Scurrg H-6 Bomber"
            threat: 3
            upgrades: [
                "Squad Leader"
                "Trajectory Simulator"
                "R4 Astromech"
                "Bomblet Generator"
                "Havoc"
            ]
        }
        {
            id: 261
            faction: "Scum and Villainy"
            pilot: "Sol Sixxa"
            ship: "Scurrg H-6 Bomber"
            threat: 3
            upgrades: [
                "Ion Cannon Turret"
                "Skilled Bombardier"
                "Conner Nets"
                "Proximity Mines"
            ]
        }
        {
            id: 262
            faction: "Scum and Villainy"
            pilot: "Lok Revenant"
            ship: "Scurrg H-6 Bomber"
            threat: 2
            upgrades: [
                "Dorsal Turret"
                "Bomblet Generator"
            ]
        }
        {
            id: 263
            faction: "Scum and Villainy"
            pilot: "IG-88A"
            suffix: " + IG-88D"
            linkedId: 264
            ship: "Aggressor"
            threat: 6
            upgrades: [
                "Advanced Sensors"
                "IG-2000"
            ]
        }
        {
            id: 264
            faction: "Scum and Villainy"
            pilot: "IG-88D"
            suffix: " + IG-88A"
            linkedId: 263
            ship: "Aggressor"
            threat: 6
            upgrades: [
                "Advanced Sensors"
                "IG-2000"
            ]
        }
        {
            id: 265
            faction: "Scum and Villainy"
            pilot: "IG-88B"
            suffix: " + IG-88C"
            linkedId: 266
            ship: "Aggressor"
            threat: 6
            upgrades: [
                "Fire-Control System"
                "Ion Cannon"
                "IG-2000"
            ]
        }
        {
            id: 266
            faction: "Scum and Villainy"
            pilot: "IG-88C"
            suffix: " + IG-88B"
            linkedId: 265
            ship: "Aggressor"
            threat: 6
            upgrades: [
                "Fire-Control System"
                "Ion Cannon"
                "IG-2000"
            ]
        }
        {
            id: 267
            faction: "Resistance"
            pilot: "L'ulo L'ampar"
            ship: "RZ-2 A-Wing"
            threat: 2
            upgrades: [
                "Primed Thrusters"
                "Homing Missiles"
            ]
        }
        {
            id: 268
            faction: "Resistance"
            pilot: "Greer Sonnel"
            ship: "RZ-2 A-Wing"
            threat: 2
            upgrades: [
                "Elusive"
                "Afterburners"
            ]
        }
        {
            id: 269
            faction: "Resistance"
            pilot: "Green Squadron Expert"
            ship: "RZ-2 A-Wing"
            threat: 2
            upgrades: [
                "Heroic"
                "Primed Thrusters"
                "Hull Upgrade"
            ]
        }
        {
            id: 270
            faction: "Resistance"
            pilot: "Tallissan Lintra"
            ship: "RZ-2 A-Wing"
            threat: 2
            upgrades: [
                "Predator"
                "Ferrosphere Paint"
            ]
        }
        {
            id: 271
            faction: "Resistance"
            pilot: "Zari Bangel"
            ship: "RZ-2 A-Wing"
            threat: 2
            upgrades: [
                "Outmaneuver"
                "Proton Rockets"
            ]
        }
        {
            id: 272
            faction: "Resistance"
            pilot: "Blue Squadron Recruit"
            ship: "RZ-2 A-Wing"
            threat: 2
            upgrades: [
                "Primed Thrusters"
                "Homing Missiles"
                "Shield Upgrade"
            ]
        }
        {
            id: 273
            faction: "Resistance"
            pilot: "Poe Dameron"
            ship: "T-70 X-Wing"
            threat: 4
            upgrades: [
                "Proton Torpedoes"
                "BB-8"
                "Black One"
                "Integrated S-Foils"
                "Afterburners"
            ]
        }
        {
            id: 274
            faction: "Resistance"
            pilot: "Jessika Pava"
            ship: "T-70 X-Wing"
            threat: 3
            upgrades: [
                "R5 Astromech"
                "Integrated S-Foils"
                "Hull Upgrade"
            ]
        }
        {
            id: 275
            faction: "Resistance"
            pilot: "Black Squadron Ace (T-70)"
            ship: "T-70 X-Wing"
            threat: 3
            upgrades: [
                "Proton Torpedoes"
                "M9-G8"
                "Integrated S-Foils"
            ]
        }
        {
            id: 276
            faction: "Resistance"
            pilot: "Ello Asty"
            ship: "T-70 X-Wing"
            threat: 3
            upgrades: [
                "Elusive"
                "Integrated S-Foils"
                "Afterburners"
            ]
        }
        {
            id: 277
            faction: "Resistance"
            pilot: "Joph Seastriker"
            ship: "T-70 X-Wing"
            threat: 3
            upgrades: [
                "R2 Astromech"
                "Integrated S-Foils"
                "Shield Upgrade"
            ]
        }
        {
            id: 278
            faction: "Resistance"
            pilot: "Jaycris Tubbs"
            ship: "T-70 X-Wing"
            threat: 2
        }
        {
            id: 279
            faction: "Resistance"
            pilot: "Nien Nunb"
            ship: "T-70 X-Wing"
            threat: 3
            upgrades: [
                "Elusive"
                "Integrated S-Foils"
                "Afterburners"
            ]
        }
        {
            id: 280
            faction: "Resistance"
            pilot: "Lieutenant Bastian"
            ship: "T-70 X-Wing"
            threat: 3
            upgrades: [
                "Targeting Synchronizer"
                "Proton Torpedoes"
                "R3 Astromech"
                "Integrated S-Foils"
            ]
        }
        {
            id: 281
            faction: "Resistance"
            pilot: "Red Squadron Expert"
            ship: "T-70 X-Wing"
            threat: 2
        }
        {
            id: 282
            faction: "Resistance"
            pilot: "Temmin Wexley"
            ship: "T-70 X-Wing"
            threat: 3
            upgrades: [
                "Outmaneuver"
                "Proton Torpedoes"
                "Integrated S-Foils"
            ]
        }
        {
            id: 283
            faction: "Resistance"
            pilot: "Kare Kun"
            ship: "T-70 X-Wing"
            threat: 3
            upgrades: [
                "Predator"
                "Integrated S-Foils"
                "Afterburners"
            ]
        }
        {
            id: 284
            faction: "Resistance"
            pilot: "Blue Squadron Rookie"
            ship: "T-70 X-Wing"
            threat: 2
            upgrades: [
                "BB Astromech"
            ]
        }
        {
            id: 285
            faction: "Resistance"
            pilot: "Finch Dallow"
            ship: "MG-100 StarFortress"
            threat: 4
            upgrades: [
                "Advanced Optics"
                "Paige Tico"
                "Proton Bombs"
                "Ablative Plating"
                "Hull Upgrade"
            ]
        }
        {
            id: 286
            faction: "Resistance"
            pilot: "Cat"
            ship: "MG-100 StarFortress"
            threat: 3
            upgrades: [
                "Skilled Bombardier"
                "Conner Nets"
                "Electronic Baffle"
            ]
        }
        {
            id: 287
            faction: "Resistance"
            pilot: "Cobalt Squadron Bomber"
            ship: "MG-100 StarFortress"
            threat: 3
            upgrades: [
                "Trajectory Simulator"
                "Proton Bombs"
                "Ablative Plating"
            ]
        }
        {
            id: 288
            faction: "Resistance"
            pilot: "Edon Kappehl"
            ship: "MG-100 StarFortress"
            threat: 4
            upgrades: [
                "Pattern Analyzer"
                "Seasoned Navigator"
                "Skilled Bombardier"
                "Conner Nets"
                "Proton Bombs"
            ]
        }
        {
            id: 289
            faction: "Resistance"
            pilot: "Vennie"
            ship: "MG-100 StarFortress"
            threat: 4
            upgrades: [
                "Advanced Optics"
                "Rose Tico"
                "Finn"
                "Shield Upgrade"
            ]
        }
        {
            id: 290
            faction: "Resistance"
            pilot: "Ben Teene"
            ship: "MG-100 StarFortress"
            threat: 3
            upgrades: [
                "Conner Nets"
                "Proton Bombs"
            ]
        }
        {
            id: 291
            faction: "Resistance"
            pilot: "Han Solo (Resistance)"
            ship: "Scavenged YT-1300"
            threat: 3
            upgrades: [
                "Chewbacca"
            ]
        }
        {
            id: 292
            faction: "Resistance"
            pilot: "Rey"
            ship: "Scavenged YT-1300"
            threat: 5
            upgrades: [
                "Finn"
                "BB-8"
                "Inertial Dampeners"
                "Engine Upgrade"
                "Rey's Millennium Falcon"
            ]
        }
        {
            id: 293
            faction: "Resistance"
            pilot: "Chewbacca (Resistance)"
            ship: "Scavenged YT-1300"
            threat: 4
            upgrades: [
                "Rey"
                "Engine Upgrade"
                "Rey's Millennium Falcon"
            ]
        }
        {
            id: 294
            faction: "Resistance"
            pilot: "Resistance Sympathizer"
            ship: "Scavenged YT-1300"
            threat: 4
            upgrades: [
                "Debris Gambit"
                "C-3PO"
                "Chewbacca"
                "Han Solo (Resistance)"
            ]
        }
        {
            id: 295
            faction: "Rebel Alliance"
            pilot: "Thane Kyrell"
            ship: "X-Wing"
            threat: 2
            upgrades: [
                "Stealth Device"
                "Outmaneuver"
            ]
        }
        {
            id: 296
            faction: "Galactic Empire"
            pilot: "Iden Versio"
            ship: "TIE Fighter"
            threat: 2
            upgrades: [
                "Proton Torpedoes"
                "Lone Wolf"
                "Targeting Computer"
            ]
        }
        {
            id: 297
            faction: "Scum and Villainy"
            pilot: "Skull Squadron Pilot"
            ship: "Fang Fighter"
            threat: 3
            upgrades: [
                "Marksmanship"
                "Adv. Proton Torpedoes"
                "Afterburners"
            ]
        }
        {
            id: 298
            faction: "Scum and Villainy"
            pilot: "Foreman Proach"
            ship: "Mining Guild TIE Fighter"
            threat: 2
            upgrades: [
                "Fearless"
                "Crack Shot"
            ]
        }
        {
            id: 299
            faction: "First Order"
            pilot: '"Blackout"'
            ship: "TIE/VN Silencer"
            threat: 3
            upgrades: [
                "Trick Shot"
            ]
        }
        {
            id: 300
            faction: "Resistance"
            pilot: "Greer Sonnel"
            ship: "RZ-2 A-Wing"
            threat: 2
            upgrades: [
                "Marksmanship"
                "Primed Thrusters"
            ]
        }
        {
            id: 301
            faction: "Scum and Villainy"
            pilot: "Han Solo (Scum)"
            ship: "Customized YT-1300"
            linkedId: 302
            suffix: " + Escape craft"
            threat: 5
            upgrades: [
                "Elusive"
                "Chewbacca"
                "Lando's Millennium Falcon"
                "Agile Gunner"
                "Tactical Scrambler"
                "Rigged Cargo Chute"
            ]
        }
        {
            id: 302
            faction: "Scum and Villainy"
            pilot: "Outer Rim Pioneer"
            ship: "Escape Craft"
            linkedId: 301
            suffix: " + Han Solo"
            threat: 5
            upgrades: [
                "Tobias Beckett"
            ]
        }
        {
            id: 303
            faction: "Scum and Villainy"
            pilot: "Lando Calrissian (Scum)"
            ship: "Customized YT-1300"
            linkedId: 304
            suffix: " + L3-37"
            threat: 4
            upgrades: [
                "Han Solo (Scum)"
                "Qi'ra"
                "Lando's Millennium Falcon"
            ]
        }
        {
            id: 304
            faction: "Scum and Villainy"
            pilot: "L3-37 (Escape Craft)"
            ship: "Escape Craft"
            linkedId: 303
            suffix: " + Lando Calrissian"
            threat: 4
            upgrades: [
            ]
        }
        {
            id: 305
            faction: "Scum and Villainy"
            pilot: "L3-37"
            ship: "Customized YT-1300"
            linkedId: 306
            suffix: " + Lando Calrissian"
            threat: 5
            upgrades: [
                "Han Solo (Scum)"
                "Qi'ra"
                "Hull Upgrade"
                "Outmaneuver"
                "Lando's Millennium Falcon"
            ]
        }
        {
            id: 306
            faction: "Scum and Villainy"
            pilot: "Lando Calrissian (Scum) (Escape Craft)"
            ship: "Escape Craft"
            linkedId: 305
            suffix: " + L3-37"
            threat: 5
            upgrades: [
                "Elusive"
                "Shield Upgrade"
            ]
        }
        {
            id: 307
            faction: "Scum and Villainy"
            pilot: "Freighter Captain"
            ship: "Customized YT-1300"
            linkedId: 308
            suffix: " + Autopilot drone"
            threat: 3
            upgrades: [
                "Lando's Millennium Falcon"
            ]
        }
        {
            id: 308
            faction: "Scum and Villainy"
            pilot: "Autopilot Drone"
            ship: "Escape Craft"
            linkedId: 307
            suffix: " + YT-1300"
            threat: 3
            upgrades: [
                "Afterburners"
            ]
        }
        {
            id: 309
            faction: "Galactic Republic"
            pilot: "Obi-Wan Kenobi"
            ship: "Delta-7 Aethersprite"
            threat: 3
            upgrades: [
                "Predictive Shot"
                "R4-P17"
                "Spare Parts Canisters"
                "Calibrated Laser Targeting"
            ]
        }
        {
            id: 310
            faction: "Galactic Republic"
            pilot: "Saesee Tiin"
            ship: "Delta-7 Aethersprite"
            threat: 3
            upgrades: [
                "Supernatural Reflexes"
                "R4-P Astromech"
                "Delta-7B"
            ]
        }
        {
            id: 311
            faction: "Galactic Republic"
            pilot: "Mace Windu"
            ship: "Delta-7 Aethersprite"
            threat: 4
            upgrades: [
                "Supernatural Reflexes"
                "R2 Astromech"
                "Delta-7B"
                "Afterburners"
                "Shield Upgrade"
            ]
        }
        {
            id: 312
            faction: "Galactic Republic"
            pilot: "Plo Koon"
            ship: "Delta-7 Aethersprite"
            threat: 3
            upgrades: [
                "Battle Meditation"
                "Sense"
                "R4-P Astromech"
                "Shield Upgrade"
            ]
        }
        {
            id: 313
            faction: "Galactic Republic"
            pilot: "Jedi Knight"
            ship: "Delta-7 Aethersprite"
            threat: 2
            upgrades: [
                "Delta-7B"
            ]
        }
        {
            id: 314
            faction: "Galactic Republic"
            pilot: '"Tucker"'
            ship: "V-19 Torrent"
            threat: 2
            upgrades: [
                "Concussion Missiles"
                "Munitions Failsafe"
            ]
        }
        {
            id: 315
            faction: "Galactic Republic"
            pilot: "Gold Squadron Trooper"
            ship: "V-19 Torrent"
            threat: 2
            upgrades: [
                "Cluster Missiles"
                "Afterburners"
            ]
        }
        {
            id: 316
            faction: "Galactic Republic"
            pilot: '"Swoop"'
            ship: "V-19 Torrent"
            threat: 2
            upgrades: [
                "Composure"
                "Synchronized Console"
                "Proton Rockets"
            ]
        }
        {
            id: 317
            faction: "Galactic Republic"
            pilot: "Blue Squadron Protector"
            ship: "V-19 Torrent"
            threat: 2
            upgrades: [
                "Dedicated"
                "Synchronized Console"
            ]
        }
        {
            id: 318
            faction: "Galactic Republic"
            pilot: '"Odd Ball"'
            ship: "V-19 Torrent"
            threat: 3
            upgrades: [
                "Saturation Salvo"
                "Cluster Missiles"
                "Afterburners"
                "Munitions Failsafe"
            ]
        }
        {
            id: 319
            faction: "Galactic Republic"
            pilot: '"Kickback"'
            ship: "V-19 Torrent"
            threat: 2
            upgrades: [
                "Crack Shot"
                "Synchronized Console"
            ]
        }
        {
            id: 320
            faction: "Galactic Republic"
            pilot: '"Axe"'
            ship: "V-19 Torrent"
            threat: 2
            upgrades: [
                "Juke"
                "Homing Missiles"
            ]
        }
        {
            id: 321
            faction: "Galactic Republic"
            pilot: '"Wolffe"'
            ship: "ARC-170"
            threat: 3
            upgrades: [
                "Outmaneuver"
                "R4-P44"
                "Veteran Tail Gunner"
                "Perceptive Copilot"
            ]
        }
        {
            id: 322
            faction: "Galactic Republic"
            pilot: '"Sinker"'
            ship: "ARC-170"
            threat: 2
            upgrades: [
                "Expert Handling"
            ]
        }
        {
            id: 323
            faction: "Galactic Republic"
            pilot: "104th Battalion Pilot"
            ship: "ARC-170"
            threat: 2
            upgrades: [
                "Dedicated"
                "R4-P Astromech"
            ]
        }
        {
            id: 324
            faction: "Galactic Republic"
            pilot: '"Odd Ball" (ARC-170)'
            ship: "ARC-170"
            threat: 3
            upgrades: [
                "Elusive"
                "Seasoned Navigator"
                "Clone Commander Cody"
                "Afterburners"
            ]
        }
        {
            id: 325
            faction: "Galactic Republic"
            pilot: '"Jag"'
            ship: "ARC-170"
            threat: 3
            upgrades: [
                "Predator"
                "Ion Torpedoes"
                "R2 Astromech"
                "Seventh Fleet Gunner"
                "Shield Upgrade"
            ]
        }
        {
            id: 326
            faction: "Galactic Republic"
            pilot: "Squad Seven Veteran"
            ship: "ARC-170"
            threat: 3
            upgrades: [
                "Expert Handling"
                "Proton Torpedoes"
                "R4-P Astromech"
                "Novice Technician"
                "Seventh Fleet Gunner"
            ]
        }
        {
            id: 327
            faction: "Scum and Villainy"
            pilot: "Black Sun Soldier"
            ship: "Z-95 Headhunter"
            threat: 2
            upgrades: [
                "Crack Shot"
                "Cluster Missiles"
                "Afterburners"
                "Shield Upgrade"
            ]
        }
        {
            id: 328
            faction: "Scum and Villainy"
            pilot: "Binayre Pirate"
            ship: "Z-95 Headhunter"
            threat: 1
            upgrades: [
                "Deadman's Switch"
            ]
        }
        {
            id: 329
            faction: "Scum and Villainy"
            pilot: "N'dru Suhlak"
            ship: "Z-95 Headhunter"
            threat: 2
            upgrades: [
                "Crack Shot"
                "Outmaneuver"
                "Hull Upgrade"
                "Stealth Device"
            ]
        }
        {
            id: 330
            faction: "Scum and Villainy"
            pilot: "Kaa'to Leeachos"
            ship: "Z-95 Headhunter"
            threat: 2
            upgrades: [
                "Saturation Salvo"
                "Cluster Missiles"
                "Concussion Missiles"
                "Deadman's Switch"
                "Munitions Failsafe"
            ]
        }
        {
            id: 331
            faction: "Galactic Empire"
            pilot: "Black Squadron Scout"
            ship: "TIE Striker"
            threat: 2
            upgrades: [
                "Predator"
                "Conner Nets"
            ]
        }
        {
            id: 332
            faction: "Galactic Empire"
            pilot: "Planetary Sentinel"
            ship: "TIE Striker"
            threat: 2
            upgrades: [
                "Proton Bombs"
                "Skilled Bombardier"
                "Hull Upgrade"
            ]
        }
        {
            id: 333
            faction: "Galactic Empire"
            pilot: '"Duchess"'
            ship: "TIE Striker"
            threat: 3
            upgrades: [
                "Outmaneuver"
                "Conner Nets"
                "Afterburners"
                "Hull Upgrade"
            ]
        }
        {
            id: 334
            faction: "Galactic Empire"
            pilot: '"Countdown"'
            ship: "TIE Striker"
            threat: 3
            upgrades: [
                "Elusive"
                "Proton Bombs"
                "Skilled Bombardier"
                "Shield Upgrade"
            ]
        }
        {
            id: 335
            faction: "Galactic Empire"
            pilot: '"Pure Sabacc"'
            ship: "TIE Striker"
            threat: 2
            upgrades: [
                "Trick Shot"
                "Shield Upgrade"
            ]
        }
        {
            id: 336
            skip: true
            faction: "Galactic Empire"
            pilot: "Planetary Sentinel"
            ship: "TIE Striker"
            threat: 2
            upgrades: [
                "Proton Bombs"
                "Skilled Bombardier"
                "Hull Upgrade"
            ]
        }
        {
            id: 337
            faction: "Separatist Alliance"
            pilot: "0-66"
            ship: "Sith Infiltrator"
            threat: 3
            upgrades: [
                "Chancellor Palpatine"
                "Shield Upgrade"
                "Scimitar"
            ]
        }
        {
            id: 338
            faction: "Separatist Alliance"
            pilot: "Dark Courier"
            ship: "Sith Infiltrator"
            threat: 3
            upgrades: [
                "Count Dooku"
                "General Grievous"
                "K2-B4"
                "Scimitar"
            ]
        }
        {
            id: 339
            faction: "Separatist Alliance"
            pilot: "Darth Maul"
            ship: "Sith Infiltrator"
            threat: 4
            upgrades: [
                "Hate"
                "Heavy Laser Cannon"
                "Perceptive Copilot"
                "DRK-1 Probe Droids"
                "Shield Upgrade"
                "Scimitar"
            ]
        }
        {
            id: 340
            faction: "Separatist Alliance"
            pilot: "Count Dooku"
            ship: "Sith Infiltrator"
            threat: 4
            upgrades: [
                "Brilliant Evasion"
                "Predictive Shot"
                "Ion Torpedoes"
                "General Grievous"
                "Hull Upgrade"
                "Scimitar"
            ]
        }
        {
            id: 341
            faction: "Separatist Alliance"
            pilot: "DFS-311"
            ship: "Vulture-class Droid Fighter"
            threat: 1
            upgrades: [
                "Grappling Struts"
            ]
        }
        {
            id: 342
            faction: "Separatist Alliance"
            pilot: "Precise Hunter"
            ship: "Vulture-class Droid Fighter"
            threat: 2
            upgrades: [
                "Concussion Missiles"
                "Afterburners"
                "Shield Upgrade"
            ]
        }
        {
            id: 343
            faction: "Separatist Alliance"
            pilot: "Separatist Drone"
            ship: "Vulture-class Droid Fighter"
            threat: 2
            upgrades: [
                "Energy-Shell Charges"
                "Grappling Struts"
                "Shield Upgrade"
            ]
        }
        {
            id: 344
            faction: "Separatist Alliance"
            pilot: "Haor Chall Prototype"
            ship: "Vulture-class Droid Fighter"
            threat: 2
            upgrades: [
                "Discord Missiles"
                "Energy-Shell Charges"
                "Stealth Device"
            ]
        }
        {
            id: 345
            faction: "Separatist Alliance"
            pilot: "Trade Federation Drone"
            ship: "Vulture-class Droid Fighter"
            threat: 1
            upgrades: [
                "Energy-Shell Charges"
            ]
        }
        {
            id: 346
            faction: "Separatist Alliance"
            pilot: "DFS-081"
            ship: "Vulture-class Droid Fighter"
            threat: 2
            upgrades: [
                "Proton Rockets"
                "Grappling Struts"
                "Hull Upgrade"
            ]
        }
        {
            id: 347
            faction: "Separatist Alliance"
            pilot: "Haor Chall Prototype"
            ship: "Vulture-class Droid Fighter"
            threat: 2
            upgrades: [
                "Energy-Shell Charges"
                "Stealth Device"
                "Afterburners"
            ]
        }
        {
            id: 348
            faction: "Separatist Alliance"
            pilot: "General Grievous"
            ship: "Belbullab-22 Starfighter"
            threat: 3
            upgrades: [
                "Treacherous"
                "Impervium Plating"
                "Soulless One"
                "TV-94"
            ]
        }
        {
            id: 349
            faction: "Separatist Alliance"
            pilot: "Wat Tambor"
            ship: "Belbullab-22 Starfighter"
            threat: 3
            upgrades: [
                "Intimidation"
                "Kraken"
                "Shield Upgrade"
            ]
        }
        {
            id: 350
            faction: "Separatist Alliance"
            pilot: "Skakoan Ace"
            ship: "Belbullab-22 Starfighter"
            threat: 2
            upgrades: [
                "Crack Shot"
                "Afterburners"
            ]
        }
        {
            id: 351
            faction: "Separatist Alliance"
            pilot: "Captain Sear"
            ship: "Belbullab-22 Starfighter"
            threat: 3
            upgrades: [
                "Daredevil"
                "Impervium Plating"
                "Kraken"
                "Stealth Device"
            ]
        }
        {
            id: 352
            faction: "Separatist Alliance"
            pilot: "Feethan Ottraw Autopilot"
            ship: "Belbullab-22 Starfighter"
            threat: 2
            upgrades: [
                "Impervium Plating"
                "TV-94"
            ]
        }
        {
            id: 353
            faction: "Resistance"
            pilot: "Cova Nell"
            ship: "Resistance Transport"
            threat: 3
            upgrades: [
                "Composure"
                "Leia Organa (Resistance)"
                "Korr Sella"
            ]
        }
        {
            id: 354
            faction: "Resistance"
            pilot: "Pammich Nerro Goode"
            ship: "Resistance Transport"
            threat: 2
            upgrades: [
                "Autoblasters"
                "R5-X3"
                "Kaydel Connix"
                "Spare Parts Canisters"
            ]
        }
        {
            id: 355
            faction: "Resistance"
            pilot: "Nodin Chavdri"
            ship: "Resistance Transport"
            threat: 2
            upgrades: [
                "Plasma Torpedoes"
                "R2-HA"
                "Angled Deflectors"
            ]
        }
        {
            id: 356
            faction: "Resistance"
            pilot: "Logistics Division Pilot"
            ship: "Resistance Transport"
            threat: 2
            upgrades: [
                "Proton Torpedoes"
                "Larma D'Acy"
                "Amilyn Holdo"
            ]
        }
        {
            id: 357
            faction: "Resistance"
            pilot: "Rose Tico"
            ship: "Resistance Transport Pod"
            threat: 1
            upgrades: [
                "PZ-4CO"
            ]
        }
        {
            id: 358
            faction: "Resistance"
            pilot: "Finn"
            ship: "Resistance Transport Pod"
            threat: 1
            upgrades: [
                "Predator"
            ]
        }
        {
            id: 359
            faction: "Resistance"
            pilot: "BB-8"
            ship: "Resistance Transport Pod"
            threat: 2
            upgrades: [
                "Autoblasters"
                "Afterburners"
            ]
        }
        {
            id: 360
            faction: "Resistance"
            pilot: "Vi Moradi"
            ship: "Resistance Transport Pod"
            threat: 1
            upgrades: [
                "GA-97"
            ]
        }
        {
            id: 361
            faction: "Galactic Republic"
            pilot: "Padmé Amidala"
            ship: "Naboo Royal N-1 Starfighter"
            threat: 2
            upgrades: [
                "Elusive"
                "Collision Detector"
            ]
        }
        {
            id: 362
            faction: "Galactic Republic"
            pilot: "Dineé Ellberger"
            ship: "Naboo Royal N-1 Starfighter"
            threat: 2
            upgrades: [
                "Passive Sensors"
                "R3 Astromech"
                "Plasma Torpedoes"
            ]
        }
        {
            id: 363
            faction: "Galactic Republic"
            pilot: "Bravo Flight Officer"
            ship: "Naboo Royal N-1 Starfighter"
            threat: 2
            upgrades: [
                "Passive Sensors"
                "R2-C4"
                "Proton Torpedoes"
            ]
        }
        {
            id: 364
            faction: "Galactic Republic"
            pilot: "Anakin Skywalker (N-1 Starfighter)"
            ship: "Naboo Royal N-1 Starfighter"
            threat: 3
            upgrades: [
                "Outmaneuver"
                "Proton Torpedoes"
                "Heightened Perception"
                "R2 Astromech"
                "Collision Detector"
            ]
        }
        {
            id: 365
            faction: "Galactic Republic"
            pilot: "Ric Olié"
            ship: "Naboo Royal N-1 Starfighter"
            threat: 2
            upgrades: [
                "Daredevil"
                "R2-A6"
            ]
        }
        {
            id: 366
            faction: "Galactic Republic"
            pilot: "Naboo Handmaiden"
            ship: "Naboo Royal N-1 Starfighter"
            threat: 2
            upgrades: [
                "Plasma Torpedoes"
                "R5 Astromech"
            ]
        }
        {
            id: 367
            faction: "Separatist Alliance"
            pilot: "Baktoid Prototype"
            ship: "Hyena-Class Droid Bomber"
            threat: 2
            upgrades: [
                "Passive Sensors"
                "Barrage Rockets"
                "Hull Upgrade"
            ]
        }
        {
            id: 368
            faction: "Separatist Alliance"
            pilot: "Bombardment Drone"
            ship: "Hyena-Class Droid Bomber"
            threat: 2
            upgrades: [
                "Trajectory Simulator"
                "Delayed Fuses"
                "Bomblet Generator"
            ]
        }
        {
            id: 369
            faction: "Separatist Alliance"
            pilot: "DBS-32C"
            ship: "Hyena-Class Droid Bomber"
            threat: 2
            upgrades: [
                "TA-175"
                "Stealth Device"
                "Landing Struts"
            ]
        }
        {
            id: 370
            faction: "Separatist Alliance"
            pilot: "DBS-404"
            ship: "Hyena-Class Droid Bomber"
            threat: 2
            upgrades: [
                "Predator"
                "Plasma Torpedoes"
                "Afterburners"
                "Landing Struts"
            ]
        }
        {
            id: 371
            faction: "Separatist Alliance"
            pilot: "Separatist Bomber"
            ship: "Hyena-Class Droid Bomber"
            threat: 2
            upgrades: [
                "Passive Sensors"
                "Diamond-Boron Missiles"
            ]
        }
        {
            id: 372
            faction: "Separatist Alliance"
            pilot: "Techno Union Bomber"
            ship: "Hyena-Class Droid Bomber"
            threat: 2
            upgrades: [
                "Proton Torpedoes"
                "Electro-Proton Bomb"
                "Delayed Fuses"
            ]
        }
        {
            id: 373
            faction: "Galactic Republic"
            pilot: "Plo Koon"
            ship: "Delta-7 Aethersprite"
            threat: [5,6,7,8]
            wingmates: [2,3,4,5]
            suffix: " and his wing"
            upgrades: [
                "Veteran Wing Leader"
                "Synchronized Console"
                "Brilliant Evasion"
                "Delta-7B"
            ]
            linkedId: 374
            wingleader: true
        }
        {
            id: 374
            faction: "Galactic Republic"
            pilot: "Gold Squadron Trooper"
            ship: "V-19 Torrent"
            suffix: ", Plo Koons wing"
            threat: '*'
            upgrades: [
                "Concussion Missiles"
                "Synchronized Console"
            ]
            linkedId: 373
            wingmate: true
        }
        {
            id: 375
            faction: "Rebel Alliance"
            pilot: "Echo Base Evacuees"
            ship: "GR-75 Medium Transport"
            threat: 4
            upgrades: [
                "Bright Hope"
                "Optimized Power Core"
                "Adaptive Shields"
                "Comms Team"
                "Point-Defense Battery"
                "Carlist Rieekan"
                "Novice Technician"
            ]
        }
        {
            id: 376
            faction: "Rebel Alliance"
            pilot: "Alderaanian Guard"
            ship: "CR90 Corellian Corvette"
            threat: 9
            upgrades: [
                "Dodonna's Pride"
                "Comms Team"
                "Boosted Scanners"
                "Sensor Experts"
                "Turbolaser Battery"
                "Ion Cannon Battery"
                "Jan Dodonna"
                "Toryn Farr"
            ]
        }
        {
            id: 377
            faction: "Galactic Empire"
            pilot: "Outer Rim Garrison"
            ship: "Gozanti-class Cruiser"
            threat: 5
            upgrades: [
                "Requiem"
                "Optimized Power Core"
                "Boosted Scanners"
                "Sensor Experts"
                "Comms Team"
                "Dorsal Turret"
                "Targeting Battery"
                "Strategic Commander"
            ]
        }
        {
            id: 378
            faction: "Galactic Empire"
            pilot: "Outer Rim Patrol"
            ship: "Raider-class Corvette"
            threat: 9
            upgrades: [
                "Impetuous"
                "Boosted Scanners"
                "Bombardment Specialists"
                "Ordnance Team"
                "Concussion Missiles"
                "Adv. Proton Torpedoes"
                "Turbolaser Battery"
                "Ordnance Tubes"
                "Captain Needa"
            ]
        }
        {
            id: 379
            faction: "Scum and Villainy"
            pilot: "Syndicate Smugglers"
            ship: "C-ROC Cruiser"
            threat: 5
            upgrades: [
                "Merchant One"
                "Quick-Release Locks"
                "Tibanna Reserves"
                "Adaptive Shields"
                "IG-RM Droids"
                "Comms Team"
                "Dorsal Turret"
                "Point-Defense Battery"
                "Azmorigan"
                "Novice Technician"
            ]
        }
        {
            id: 380
            faction: "Resistance"
            pilot: "Colossus Station Mechanic"
            ship: "Fireball"
            threat: 1
            upgrades: [
                "Snap Shot"
            ]
        }
        {
            id: 381
            faction: "Resistance"
            pilot: "Jarek Yeager"
            ship: "Fireball"
            threat: 2
            upgrades: [
                "Targeting Computer"
                "Advanced SLAM"
                "Mag-Pulse Warheads"
                "Elusive"
            ]
        }
        {
            id: 382
            faction: "Resistance"
            pilot: "Kazuda Xiono"
            ship: "Fireball"
            threat: 2
            upgrades: [
                "Kaz's Fireball"
                "Advanced SLAM"
                "Coaxium Hyperfuel"
                "R1-J5"
                "Outmaneuver"
            ]
        }
        {
            id: 383
            faction: "Resistance"
            pilot: "R1-J5"
            ship: "Fireball"
            threat: 2
            upgrades: [
                "Targeting Computer"
                "Afterburners"
                "Mag-Pulse Warheads"
                "Coaxium Hyperfuel"
            ]
        }
        {
            id: 384
            faction: "Resistance"
            pilot: "New Republic Volunteers"
            ship: "GR-75 Medium Transport"
            threat: 4
            upgrades: [
                "Tibanna Reserves"
                "Boosted Scanners"
                "Sensor Experts"
                "Dorsal Turret"
                "Ion Cannon Battery"
                "Stalwart Captain"
            ]
        }
        {
            id: 385
            faction: "First Order"
            pilot: "Major Vonreg"
            ship: "TIE/Ba Interceptor"
            threat: 3
            upgrades: [
                "Mag-Pulse Warheads"
                "Deuterium Power Cells"
                "Outmaneuver"
            ]
        }
        {
            id: 386
            faction: "First Order"
            pilot: '"Holo"'
            ship: "TIE/Ba Interceptor"
            threat: 3
            upgrades: [
                "Hull Upgrade"
                "Munitions Failsafe"
                "Mag-Pulse Warheads"
                "Proud Tradition"
            ]
        }
        {
            id: 387
            faction: "First Order"
            pilot: '"Ember"'
            ship: "TIE/Ba Interceptor"
            threat: 3
            upgrades: [
                "Afterburners"
                "Concussion Missiles"
                "Predator"
                "Elusive"
            ]
        }
        {
            id: 388
            faction: "First Order"
            pilot: "First Order Provocateur"
            ship: "TIE/Ba Interceptor"
            threat: 2
            upgrades: [
                "Snap Shot"
            ]
        }
        {
            id: 389
            faction: "First Order"
            pilot: "First Order Sympathizers"
            ship: "Gozanti-class Cruiser"
            threat: 4
            upgrades: [
                "Adaptive Shields"
                "Gunnery Specialists"
                "Damage Control Team"
                "Point-Defense Battery"
                "Strategic Commander"
            ]
        }
        {
            id: 390
            faction: "First Order"
            pilot: "First Order Collaborators"
            ship: "Raider-class Corvette"
            threat: 8
            upgrades: [
                "Boosted Scanners"
                "Comms Team"
                "Bombardment Specialists"
                "Point-Defense Battery"
                "Ion Cannon Battery"
                "Stalwart Captain"
                "Novice Technician"
            ]
        }
        {
            id: 391
            faction: "Galactic Republic"
            pilot: "Shadow Squadron Veteran"
            ship: "BTL-B Y-Wing"
            threat: 3
            upgrades: [
                "R5 Astromech"
                "Proton Torpedoes"
                "Ion Cannon Turret"
                "Snap Shot"
            ]
        }
        {
            id: 392
            faction: "Galactic Republic"
            pilot: "Anakin Skywalker (Y-Wing)"
            ship: "BTL-B Y-Wing"
            threat: 4
            upgrades: [
                "Proton Bombs"
                "R2 Astromech"
                "Ahsoka Tano"
                "Proton Torpedoes"
                "Ion Cannon Turret"
                "Precognitive Reflexes"
            ]
        }
        {
            id: 393
            faction: "Galactic Republic"
            pilot: "R2-D2"
            ship: "BTL-B Y-Wing"
            threat: 2
            upgrades: [
                "Proton Bombs"
                "C-3PO"
                "Ion Cannon Turret"
            ]
        }
        {
            id: 394
            faction: "Galactic Republic"
            pilot: '"Odd Ball" (Y-Wing)'
            ship: "BTL-B Y-Wing"
            threat: 3
            upgrades: [
                "Hull Upgrade"
                "R3 Astromech"
                "Proton Torpedoes"
                "Ion Cannon Turret"
                "Predator"
            ]
        }
        {
            id: 395
            faction: "Galactic Republic"
            pilot: '"Matchstick"'
            ship: "BTL-B Y-Wing"
            threat: 3
            upgrades: [
                "Shield Upgrade"
                "Delayed Fuses"
                "Proton Bombs"
                "R2 Astromech"
                "Ion Cannon Turret"
                "Elusive"
            ]
        }
        {
            id: 396
            faction: "Galactic Republic"
            pilot: '"Broadside"'
            ship: "BTL-B Y-Wing"
            threat: 2
            upgrades: [
                "Hull Upgrade"
                "R5 Astromech"
                "Ion Cannon Turret"
                "Snap Shot"
            ]
        }
        {
            id: 397
            faction: "Galactic Republic"
            pilot: '"Goji"'
            ship: "BTL-B Y-Wing"
            threat: 2
            upgrades: [
                "Afterburners"
                "Electro-Proton Bomb"
            ]
        }
        {
            id: 398
            faction: "Galactic Republic"
            pilot: "Red Squadron Bomber"
            ship: "BTL-B Y-Wing"
            threat: 2
            upgrades: [
                "Delayed Fuses"
                "Proton Bombs"
                "R2 Astromech"
                "Ion Cannon Turret"
            ]
        }
        {
            id: 399
            faction: "Galactic Republic"
            pilot: "Republic Judiciary"
            ship: "CR90 Corellian Corvette"
            threat: 9
            upgrades: [
                "Strategic Commander"
                "Targeting Battery"
                "Turbolaser Battery"
                "Damage Control Team"
                "Agile Gunner"
                "Boosted Scanners"
                "Gunnery Specialists"
                "Seasoned Navigator"
            ]
        }
        {
            id: 400
            faction: "Separatist Alliance"
            pilot: "Stalgasin Hive Guard"
            ship: "Nantex-Class Starfighter"
            threat: 2
            upgrades: [
                "Targeting Computer"
                "Gravitic Deflection"
                "Ensnare"
            ]
        }
        {
            id: 401
            faction: "Separatist Alliance"
            pilot: "Sun Fac"
            ship: "Nantex-Class Starfighter"
            threat: 3
            upgrades: [
                "Shield Upgrade"
                "Afterburners"
                "Predator"
                "Ensnare"
            ]
        }
        {
            id: 402
            faction: "Separatist Alliance"
            pilot: "Berwer Kret"
            ship: "Nantex-Class Starfighter"
            threat: 2
            upgrades: [
                "Hull Upgrade"
                "Snap Shot"
                "Ensnare"
            ]
        }
        {
            id: 403
            faction: "Separatist Alliance"
            pilot: "Chertek"
            ship: "Nantex-Class Starfighter"
            threat: 2
            upgrades: [
                "Targeting Computer"
                "Juke"
                "Gravitic Deflection"
            ]
        }
        {
            id: 404
            faction: "Separatist Alliance"
            pilot: "Gorgol"
            ship: "Nantex-Class Starfighter"
            threat: 2
            upgrades: [
                "Stealth Device"
                "Shield Upgrade"
                "Gravitic Deflection"
            ]
        }
        {
            id: 405
            faction: "Separatist Alliance"
            pilot: "Separatist Privateers"
            ship: "C-ROC Cruiser"
            threat: 6
            upgrades: [
                "Stalwart Captain"
                "Turbolaser Battery"
                "Dorsal Turret"
                "Heavy Laser Cannon"
                "Cluster Missiles"
                "Bombardment Specialists"
                "Boosted Scanners"
                "Tibanna Reserves"
                "Corsair Refit"
            ]
        }
        {
            id: 406
            faction: "Galactic Empire"
            pilot: "Darth Vader"
            ship: "TIE Advanced"
            threat: [6,7,8,9]
            wingmates: [2,3,4,5]
            suffix: " and his wing"
            upgrades: [
                "Agent of the Empire"
                "Fire-Control System"
                "Supernatural Reflexes"
                "Cluster Missiles"
            ]
            linkedId: 407
            wingleader: true
        }
        {
            id: 407
            faction: "Galactic Empire"
            pilot: "Black Squadron Ace"
            ship: "TIE Fighter"
            suffix: ", Darth Vaders wing"
            threat: '*'
            upgrades: [
                "Crack Shot"
            ]
            linkedId: 406
            wingmate: true
        }
        {
            id: 408
            faction: "Resistance"
            pilot: "Poe Dameron"
            ship: "T-70 X-Wing"
            threat: [9,11,13,15]
            wingmates: [2,3,4,5]
            suffix: " and his wing"
            upgrades: [
                "Veteran Wing Leader"
                "Targeting Synchronizer"
                "BB-8"
                "Black One"
            ]
            linkedId: 409
            wingleader: true
        }
        {
            id: 409
            faction: "Resistance"
            pilot: "Black Squadron Ace (T-70)"
            ship: "T-70 X-Wing"
            suffix: ", Poe Damerons wing"
            threat: '*'
            upgrades: [
                "Proton Torpedoes"
            ]
            linkedId: 408
            wingmate: true
        }
        {
            id: 410
            faction: "First Order"
            pilot: "Kylo Ren"
            ship: "TIE/VN Silencer"
            threat: [6,8]
            wingmates: [2,3]
            suffix: " and his wing"
            upgrades: [
                "First Order Elite"
                "Heightened Perception"
                "Dreadnought Hunter"
                "Proton Torpedoes"
            ]
            linkedId: 411
            wingleader: true
        }
        {
            id: 411
            faction: "First Order"
            pilot: "Omega Squadron Expert"
            ship: "TIE/SF Fighter"
            suffix: ", Kylo Rens wing"
            threat: '*'
            upgrades: [
                "Ion Missiles"
                "Special Forces Gunner"
            ]
            linkedId: 410
            wingmate: true
        }
        {
            id: 412
            faction: "Separatist Alliance"
            pilot: "General Grievous"
            ship: "Belbullab-22 Starfighter"
            threat: [5,6,7,8]
            wingmates: [2,3,4,5]
            suffix: " and his wing"
            upgrades: [
                "Veteran Wing Leader"
                "Kraken"
                "Predator"
                "Soulless One"
            ]
            linkedId: 413
            wingleader: true
        }
        {
            id: 413
            faction: "Separatist Alliance"
            pilot: "Separatist Drone"
            ship: "Vulture-class Droid Fighter"
            suffix: ", General Grievous wing"
            threat: '*'
            upgrades: [
                "Energy-Shell Charges"
            ]
            linkedId: 412
            wingmate: true
        }
        {
            id: 414
            faction: "Rebel Alliance"
            pilot: "Luke Skywalker"
            ship: "X-Wing"
            threat: [8,10,12,14]
            wingmates: [2,3,4,5]
            suffix: " and his wing"
            upgrades: [
                "Veteran Wing Leader"
                "Proton Torpedoes"
                "Instinctive Aim"
                "R2-D2"
                "Servomotor S-Foils"
            ]
            linkedId: 415
            wingleader: true
        }
        {
            id: 415
            faction: "Rebel Alliance"
            pilot: "Red Squadron Veteran"
            ship: "X-Wing"
            suffix: ", Luke Skywalkers wing"
            threat: '*'
            upgrades: [
                "Proton Torpedoes"
            ]
            linkedId: 414
            wingmate: true
        }
        {
            id: 416
            faction: "Scum and Villainy"
            pilot: "Fenn Rau"
            ship: "Fang Fighter"
            threat: [8,10,12,14]
            wingmates: [2,3,4,5]
            suffix: " and his wing"
            upgrades: [
                "Veteran Wing Leader"
                "Fearless"
                "Daredevil"
                "Afterburners"
            ]
            linkedId: 417
            wingleader: true
        }
        {
            id: 417
            faction: "Scum and Villainy"
            pilot: "Skull Squadron Pilot"
            ship: "Fang Fighter"
            suffix: ", Fenn Raus wing"
            threat: '*'
            upgrades: [
                "Fearless"
            ]
            linkedId: 416
            wingmate: true
        }
        {
            id: 418
            faction: "Rebel Alliance"
            pilot: "Gina Moonsong"
            ship: "B-Wing"
            threat: 3
            upgrades: [
                "Elusive"
                "Afterburners"
                "Passive Sensors"
                "Stabilized S-Foils"
                "Autoblasters"
            ]
        }
        {
            id: 419
            faction: "Rebel Alliance"
            pilot: "Leia Organa"
            ship: "YT-1300"
            threat: 4
            upgrades: [
                "Chewbacca"
                "Millennium Falcon"
                "Lando Calrissian"
                "Engine Upgrade"
                "R2-D2"
            ]
        }
        {
            id: 420
            faction: "Rebel Alliance"
            pilot: "Blue Squadron Pilot"
            ship: "B-Wing"
            threat: 2
            upgrades: [
                "Passive Sensors"
                "Stabilized S-Foils"
                "Plasma Torpedoes"
            ]
        }
        {
            id: 421
            faction: "Rebel Alliance"
            pilot: "Blade Squadron Veteran"
            ship: "B-Wing"
            threat: 3
            upgrades: [
                "Snap Shot"
                "Stabilized S-Foils"
                "Autoblasters"
                "Proton Torpedoes"
                "Angled Deflectors"
            ]
        }
        {
            id: 422
            faction: "Rebel Alliance"
            pilot: "Outer Rim Smuggler"
            ship: "YT-1300"
            threat: 3
            upgrades: [
                "Homing Missiles"
                "Shield Upgrade"
            ]
        }
        {
            id: 423
            faction: "Rebel Alliance"
            pilot: "Alexsandr Kallus"
            ship: "VCX-100"
            threat: 4
            upgrades: [
                "Passive Sensors"
                "Ghost"
                "Proton Torpedoes"
                "Shield Upgrade"
                '"Zeb" Orrelios'
            ]
        }
        {
            id: 424
            faction: "Rebel Alliance"
            pilot: "Lothal Rebel"
            ship: "VCX-100"
            threat: 3
            upgrades: [
                "Passive Sensors"
                "Plasma Torpedoes"
            ]
        }
        {
            id: 425
            faction: "Rebel Alliance"
            pilot: "Partisan Renegade"
            ship: "U-Wing"
            threat: 3
            upgrades: [
                "Magva Yarro"
                "Deadman's Switch"
                "Pivot Wing"
                "Saw Gerrera"
            ]
        }
        {
            id: 426
            faction: "Resistance"
            pilot: "Blue Squadron Recruit"
            ship: "RZ-2 A-Wing"
            threat: 2
            upgrades: [
                "Primed Thrusters"
                "Composure"
                "Snap Shot"
            ]
        }
        {
            id: 427
            faction: "Resistance"
            pilot: "Ronith Blario"
            ship: "RZ-2 A-Wing"
            threat: 2
            upgrades: [
                "Mag-Pulse Warheads"
                "Pattern Analyzer"
                "Snap Shot"
            ]
        }
        {
            id: 428
            faction: "Resistance"
            pilot: "Zizi Tlo"
            ship: "RZ-2 A-Wing"
            threat: 2
            upgrades: [
                "Elusive"
                "Advanced Optics"
                "Snap Shot"
                "Afterburners"
            ]
        }
        {
            id: 429
            faction: "Resistance"
            pilot: "Cobalt Squadron Bomber"
            ship: "MG-100 StarFortress"
            threat: 3
            upgrades: [
                "Passive Sensors"
                "Conner Nets"
                "Hull Upgrade"
                "Agile Gunner"
            ]
        }
        {
            id: 430
            faction: "Resistance"
            pilot: "Paige Tico"
            ship: "MG-100 StarFortress"
            threat: 3
            upgrades: [
                "Rose Tico"
                "Proton Bombs"
                "Skilled Bombardier"
            ]
        }
        {
            id: 431
            faction: "Scum and Villainy"
            pilot: "Bossk"
            ship: "Z-95 Headhunter"
            threat: 2
            upgrades: [
                "Predator"
                "Snap Shot"
                "Afterburners"
            ]
        }
        {
            id: 432
            faction: "Scum and Villainy"
            pilot: "Binayre Pirate"
            ship: "Z-95 Headhunter"
            threat: 2
            upgrades: [
                "Concussion Missiles"
                "Snap Shot"
                "Afterburners"
            ]
        }
        {
            id: 433
            faction: "Scum and Villainy"
            pilot: "Black Sun Soldier"
            ship: "Z-95 Headhunter"
            threat: 1
            upgrades: [
                "Composure"
            ]
        }
        {
            id: 434
            faction: "Scum and Villainy"
            pilot: "Contracted Scout"
            ship: "JumpMaster 5000"
            threat: 2
            upgrades: [
                "Plasma Torpedoes"
            ]
        }
        {
            id: 435
            faction: "Scum and Villainy"
            pilot: "Nom Lumb"
            ship: "JumpMaster 5000"
            threat: 3
            upgrades: [
                "Proton Torpedoes"
                "Snap Shot"
                "Afterburners"
                "Dengar"
                "Deadman's Switch"
            ]
        }
        {
            id: 436
            faction: "Scum and Villainy"
            pilot: "Tansarii Point Veteran"
            ship: "M3-A Interceptor"
            threat: 2
            upgrades: [
                "Outmaneuver"
                "Munitions Failsafe"
                "Plasma Torpedoes"
            ]
        }
        {
            id: 437
            faction: "Scum and Villainy"
            pilot: "G4R-GOR V/M"
            ship: "M3-A Interceptor"
            threat: 2
            upgrades: [
                "Intimidation"
                "Shield Upgrade"
                "Deadman's Switch"
                "Autoblasters"
            ]
        }
        {
            id: 438
            faction: "Scum and Villainy"
            pilot: "Cartel Spacer"
            ship: "M3-A Interceptor"
            threat: 2
            upgrades: [
                "Snap Shot"
                "Shield Upgrade"
                "Autoblasters"
            ]
        }
        {
            id: 439
            faction: "Galactic Empire"
            pilot: "Patrol Leader"
            ship: "VT-49 Decimator"
            threat: 3
            upgrades: [
                "Hull Upgrade"
                "Tactical Scrambler"
            ]
        }
        {
            id: 440
            faction: "Galactic Empire"
            pilot: "Morna Kee"
            ship: "VT-49 Decimator"
            threat: 4
            upgrades: [
                "Shield Upgrade"
                "Plasma Torpedoes"
                "Proximity Mines"
                'GNK "Gonk" Droid'
            ]
        }
        {
            id: 441
            faction: "Galactic Empire"
            pilot: "Black Squadron Scout"
            ship: "TIE Striker"
            threat: 2
            upgrades: [
                "Snap Shot"
                "Targeting Computer"
            ]
        }
        {
            id: 442
            faction: "Galactic Empire"
            pilot: '"Vagabond"'
            ship: "TIE Striker"
            threat: 3
            upgrades: [
                "Outmaneuver"
                "Afterburners"
                "Skilled Bombardier"
                "Proton Bombs"
            ]
        }
        {
            id: 443
            faction: "Galactic Empire"
            pilot: "Planetary Sentinel"
            ship: "TIE Striker"
            threat: 2
            upgrades: [
                "Conner Nets"
                "Trick Shot"
            ]
        }
        {
            id: 444
            faction: "Galactic Empire"
            pilot: "Inquisitor"
            ship: "TIE Advanced Prototype"
            threat: 2
            upgrades: [
                "Brilliant Evasion"
                "Afterburners"
            ]
        }
        {
            id: 445
            faction: "Galactic Empire"
            pilot: "Baron of the Empire"
            ship: "TIE Advanced Prototype"
            threat: 2
            upgrades: [
                "Snap Shot"
                "Mag-Pulse Warheads"
            ]
        }
        {
            id: 446
            faction: "Galactic Empire"
            pilot: "Fifth Brother"
            ship: "TIE Advanced Prototype"
            threat: 2
            upgrades: [
                "Foresight"
            ]
        }
        {
            id: 447
            faction: "First Order"
            pilot: "Zeta Squadron Survivor"
            ship: "TIE/SF Fighter"
            threat: 2
            upgrades: [
                "Passive Sensors"
                "Advanced Optics"
                "Proud Tradition"
            ]
        }
        {
            id: 448
            faction: "First Order"
            pilot: "Lieutenant LeHuse"
            ship: "TIE/SF Fighter"
            threat: 2
            upgrades: [
                "Elusive"
                "Mag-Pulse Warheads"
                "Angled Deflectors"
            ]
        }
        {
            id: 449
            faction: "First Order"
            pilot: "Captain Phasma"
            ship: "TIE/SF Fighter"
            threat: 3
            upgrades: [
                "Advanced Optics"
                "Ion Missiles"
                "Special Forces Gunner"
                "Outmaneuver"
                "Shield Upgrade"
            ]
        }
        {
            id: 450
            faction: "First Order"
            pilot: "First Order Test Pilot"
            ship: "TIE/VN Silencer"
            threat: 3
            upgrades: [
                "Proud Tradition"
                "Plasma Torpedoes"
                "Passive Sensors"
            ]
        }
        {
            id: 451
            faction: "First Order"
            pilot: "Sienar-Jaemus Engineer"
            ship: "TIE/VN Silencer"
            threat: 3
            upgrades: [
                "Afterburners"
                "Mag-Pulse Warheads"
                "Passive Sensors"
                "Snap Shot"
            ]
        }
        {
            id: 452
            faction: "First Order"
            pilot: '"Rush"'
            ship: "TIE/VN Silencer"
            threat: 3
            upgrades: [
                "Primed Thrusters"
                "Angled Deflectors"
                "Proton Torpedoes"
            ]
        }
        {
            id: 453
            faction: "Galactic Empire"
            pilot: "Seventh Sister"
            ship: "TIE Advanced Prototype"
            threat: 3
            upgrades: [
                "Predictive Shot"
                "Proton Rockets"
                "Afterburners"
                "Hull Upgrade"
            ]
        }
        {
            id: 454
            faction: "Galactic Empire"
            pilot: "Inquisitor"
            ship: "TIE Advanced Prototype"
            threat: 2
            upgrades: [
                "Heightened Perception"
                "Proton Rockets"
            ]
        }
        {
            id: 455
            faction: "Galactic Empire"
            pilot: "Grand Inquisitor"
            ship: "TIE Advanced Prototype"
            threat: 3
            upgrades: [
                "Hate"
                "Proton Rockets"
                "Shield Upgrade"
            ]
        }
        {
            id: 456
            faction: "Galactic Empire"
            pilot: "Baron of the Empire"
            ship: "TIE Advanced Prototype"
            threat: 3
            upgrades: [
                "Elusive"
                "Outmaneuver"
                "Afterburners"
            ]
        }
    ]

exportObj.setupCommonCardData = (basic_cards) ->
    # assert that each ID is the index into BLAHById (should keep this, in general)
    for pilot_data, i in basic_cards.pilotsById
        if pilot_data.id != i
            throw new Error("ID mismatch: pilot at index #{i} has ID #{pilot_data.id}")
    for upgrade_data, i in basic_cards.upgradesById
        if upgrade_data.id != i
            throw new Error("ID mismatch: upgrade at index #{i} has ID #{upgrade_data.id}")
    for condition_data, i in basic_cards.conditionsById
        if condition_data.id != i
            throw new Error("ID mismatch: condition at index #{i} has ID #{condition_data.id}")
    for quickbuild_data, i in basic_cards.quickbuildsById
        if quickbuild_data.id != i
            throw new Error("ID mismatch: quickbuild  at index #{i} has ID #{quickbuild_data.id}")


    exportObj.pilots = {}
    # Assuming a given pilot is unique by name...
    for pilot_data in basic_cards.pilotsById
        unless pilot_data.skip?
            pilot_data.sources = []
            pilot_data.canonical_name = pilot_data.name.canonicalize() unless pilot_data.canonical_name?
            exportObj.pilots[pilot_data.name] = pilot_data
    # pilot_name is the English version here as it's the common index into
    # basic card info

    exportObj.upgrades = {}
    for upgrade_data in basic_cards.upgradesById
        unless upgrade_data.skip?
            upgrade_data.sources = []
            upgrade_data.canonical_name = upgrade_data.name.canonicalize() unless upgrade_data.canonical_name?
            exportObj.upgrades[upgrade_data.name] = upgrade_data

    exportObj.conditions = {}
    for condition_data in basic_cards.conditionsById
        unless condition_data.skip?
            condition_data.sources = []
            condition_data.canonical_name = condition_data.name.canonicalize() unless condition_data.canonical_name?
            exportObj.conditions[condition_data.name] = condition_data

    # there is no exportObj.quickbuilds generated from basic_cards.quickbuildsById, as reference by pilot name might be ambigous (e.g. there are multiple Black Sq. Aces having different upgrades)

    exportObj.quickbuildsById = {}
    quickbuild_count = 0
    for quickbuild_data in basic_cards.quickbuildsById
        unless quickbuild_data.skip?
            quickbuild_count += 1
            # Sometimes there is something to be appended to the pilot name for displaying, e.g. (x2) for two TIEs at the cost of 3 threat points. If nothing specified set as empty string.
            quickbuild_data.suffix = "" unless quickbuild_data.suffix?
            exportObj.quickbuildsById[quickbuild_data.id] = quickbuild_data
    if Object.keys(exportObj.quickbuildsById).length != quickbuild_count
        throw new Error("At least one quickbuild shares an ID with another")

    for ship_name, ship_data of basic_cards.ships
        ship_data.canonical_name ?= ship_data.name.canonicalize()
        ship_data.sources = []

    # Set sources from manifest
    for expansion, cards of exportObj.manifestByExpansion
        # console.log(exportObj.manifestByExpansion)
        for card in cards
            continue if card.skipForSource # heavy scyk special case :(
            try
                switch card.type
                    when 'pilot'
                        exportObj.pilots[card.name].sources.push expansion
                    when 'upgrade'
                        exportObj.upgrades[card.name].sources.push expansion
                    when 'ship'
                        exportObj.ships[card.name].sources.push expansion
                    else
                        throw new Error("Unexpected card type #{card.type} for card #{card.name} of #{expansion}")
            catch e
                console.log(e)
                console.error "Error adding card #{card.name} (#{card.type}) from #{expansion}"


    for name, card of exportObj.pilots
        card.sources = card.sources.sort()
    for name, card of exportObj.upgrades
        card.sources = card.sources.sort()

    exportObj.expansions = {}

    exportObj.pilotsById = {}
    for pilot_name, pilot of exportObj.pilots
        exportObj.fixIcons pilot
        exportObj.pilotsById[pilot.id] = pilot
        for source in pilot.sources
            exportObj.expansions[source] = 1 if source not of exportObj.expansions
    if Object.keys(exportObj.pilotsById).length != Object.keys(exportObj.pilots).length
        throw new Error("At least one pilot shares an ID with another")

    exportObj.pilotsByFactionCanonicalName = {}
    # uniqueness can't be enforced just be canonical name, but by the base part
    exportObj.pilotsByUniqueName = {}
    for pilot_name, pilot of exportObj.pilots
        ((exportObj.pilotsByFactionCanonicalName[pilot.faction] ?= {})[pilot.canonical_name] ?= []).push pilot
        (exportObj.pilotsByUniqueName[pilot.canonical_name.getXWSBaseName()] ?= []).push pilot

    exportObj.pilotsByFactionXWS = {}
    for pilot_name, pilot of exportObj.pilots
        ((exportObj.pilotsByFactionXWS[pilot.faction] ?= {})[pilot.xws] ?= []).push pilot


    exportObj.upgradesById = {}
    for upgrade_name, upgrade of exportObj.upgrades
        exportObj.fixIcons upgrade
        exportObj.upgradesById[upgrade.id] = upgrade
        for source in upgrade.sources
            exportObj.expansions[source] = 1 if source not of exportObj.expansions
    if Object.keys(exportObj.upgradesById).length != Object.keys(exportObj.upgrades).length
        throw new Error("At least one upgrade shares an ID with another")

    exportObj.upgradesBySlotCanonicalName = {}
    exportObj.upgradesBySlotXWSName = {}
    exportObj.upgradesBySlotUniqueName = {}
    for upgrade_name, upgrade of exportObj.upgrades
        (exportObj.upgradesBySlotCanonicalName[upgrade.slot] ?= {})[upgrade.canonical_name] = upgrade
        (exportObj.upgradesBySlotXWSName[upgrade.slot] ?= {})[upgrade.xws] = upgrade
        (exportObj.upgradesBySlotUniqueName[upgrade.slot] ?= {})[upgrade.canonical_name.getXWSBaseName()] = upgrade

    exportObj.conditionsById = {}
    for condition_name, condition of exportObj.conditions
        exportObj.fixIcons condition
        exportObj.conditionsById[condition.id] = condition
        for source in condition.sources
            exportObj.expansions[source] = 1 if source not of exportObj.expansions
    if Object.keys(exportObj.conditionsById).length != Object.keys(exportObj.conditions).length
        throw new Error("At least one condition shares an ID with another")

    exportObj.conditionsByCanonicalName = {}
    for condition_name, condition of exportObj.conditions
        (exportObj.conditionsByCanonicalName ?= {})[condition.canonical_name] = condition

    exportObj.expansions = Object.keys(exportObj.expansions).sort()



exportObj.setupTranslationCardData = (pilot_translations, upgrade_translations, condition_translations) ->
    for upgrade_name, translations of upgrade_translations
        exportObj.fixIcons translations
        for field, translation of translations
            try
                exportObj.upgrades[upgrade_name][field] = translation
            catch e
                console.error "Cannot find translation for attribute #{field} for upgrade #{upgrade_name}. Please report this Issue. "
                # throw e

    for condition_name, translations of condition_translations
        exportObj.fixIcons translations
        for field, translation of translations
            try
                exportObj.conditions[condition_name][field] = translation
            catch e
                console.error "Cannot find translation for attribute #{field} for condition #{condition_name}. Please report this Issue. "
                # throw e

    for pilot_name, translations of pilot_translations
        exportObj.fixIcons translations
        for field, translation of translations
            try
                exportObj.pilots[pilot_name][field] = translation
            catch e
                console.error "Cannot find translation for attribute #{field} for pilot #{pilot_name}. Please report this Issue. "
                # throw e

exportObj.fixIcons = (data) ->
    if data.text?
        data.text = data.text
            .replace(/%BULLSEYEARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-bullseyearc"></i>')
            .replace(/%SINGLETURRETARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-singleturretarc"></i>')
            .replace(/%DOUBLETURRETARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-doubleturretarc"></i>')
            .replace(/%FRONTARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-frontarc"></i>')
            .replace(/%REARARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-reararc"></i>')
            .replace(/%LEFTARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-leftarc"></i>')
            .replace(/%RIGHTARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-rightarc"></i>')
            .replace(/%ROTATEARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-rotatearc"></i>')
            .replace(/%FULLFRONTARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-fullfrontarc"></i>')
            .replace(/%FULLREARARC%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-fullreararc"></i>')
            .replace(/%DEVICE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-device"></i>')
            .replace(/%MODIFICATION%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-modification"></i>')
            .replace(/%RELOAD%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-reload"></i>')
            .replace(/%CONFIG%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-config"></i>')
            .replace(/%FORCE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-forcecharge"></i>')
            .replace(/%CHARGE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-charge"></i>')
            .replace(/%ENERGY%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-energy"></i>')
            .replace(/%CALCULATE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-calculate"></i>')
            .replace(/%BANKLEFT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-bankleft"></i>')
            .replace(/%BANKRIGHT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-bankright"></i>')
            .replace(/%BARRELROLL%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-barrelroll"></i>')
            .replace(/%BOOST%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-boost"></i>')
            .replace(/%CANNON%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-cannon"></i>')
            .replace(/%CARGO%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-cargo"></i>')
            .replace(/%CLOAK%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-cloak"></i>')
            .replace(/%F-COORDINATE%/g, '<i class="xwing-miniatures-font force xwing-miniatures-font-coordinate"></i>')
            .replace(/%COORDINATE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-coordinate"></i>')
            .replace(/%CRIT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-crit"></i>')
            .replace(/%ASTROMECH%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-astromech"></i>')
            .replace(/%GUNNER%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-gunner"></i>')
            .replace(/%CREW%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-crew"></i>')
            .replace(/%DUALCARD%/g, '<span class="card-restriction">Dual card.</span>')
            .replace(/%ELITE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-elite"></i>')
            .replace(/%TACTICALRELAY%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-tacticalrelay"></i>')
            .replace(/%SALVAGEDASTROMECH%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-salvagedastromech"></i>')
            .replace(/%HARDPOINT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-hardpoint"></i>')
            .replace(/%EVADE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-evade"></i>')
            .replace(/%FOCUS%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-focus"></i>')
            .replace(/%HIT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-hit"></i>')
            .replace(/%ILLICIT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-illicit"></i>')
            .replace(/%JAM%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-jam"></i>')
            .replace(/%KTURN%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-kturn"></i>')
            .replace(/%MISSILE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-missile"></i>')
            .replace(/%RECOVER%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-recover"></i>')
            .replace(/%F-REINFORCE%/g, '<i class="xwing-miniatures-font force xwing-miniatures-font-reinforce"></i>')
            .replace(/%REINFORCE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-reinforce"></i>')
            .replace(/%REVERSESTRAIGHT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-reversestraight"></i>')
            .replace(/%REVERSEBANKLEFT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-reversebankleft"></i>')
            .replace(/%REVERSEBANKRIGHT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-reversebankright"></i>')
            .replace(/%SHIELD%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-shield"></i>')
            .replace(/%SLAM%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-slam"></i>')
            .replace(/%SLOOPLEFT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-sloopleft"></i>')
            .replace(/%SLOOPRIGHT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-sloopright"></i>')
            .replace(/%STRAIGHT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-straight"></i>')
            .replace(/%STOP%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-stop"></i>')
            .replace(/%SENSOR%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-sensor"></i>')
            .replace(/%LOCK%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-lock"></i>')
            .replace(/%TORPEDO%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-torpedo"></i>')
            .replace(/%TROLLLEFT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-trollleft"></i>')
            .replace(/%TROLLRIGHT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-trollright"></i>')
            .replace(/%TURNLEFT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-turnleft"></i>')
            .replace(/%TURNRIGHT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-turnright"></i>')
            .replace(/%TURRET%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-turret"></i>')
            .replace(/%UTURN%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-kturn"></i>')
            .replace(/%TALENT%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-talent"></i>')
            .replace(/%TITLE%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-title"></i>')
            .replace(/%TEAM%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-team"></i>')
            .replace(/%TECH%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-tech"></i>')
            .replace(/%FORCEPOWER%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-forcepower"></i>')
            .replace(/%LARGESHIPONLY%/g, '<span class="card-restriction">Large ship only.</span>')
            .replace(/%SMALLSHIPONLY%/g, '<span class="card-restriction">Small ship only.</span>')
            .replace(/%REBELONLY%/g, '<span class="card-restriction">Rebel only.</span>')
            .replace(/%IMPERIALONLY%/g, '<span class="card-restriction">Imperial only.</span>')
            .replace(/%SCUMONLY%/g, '<span class="card-restriction">Scum only.</span>')
            .replace(/%LIMITED%/g, '<span class="card-restriction">Limited.</span>')
            .replace(/%CONFIGURATION%/g, '<i class="xwing-miniatures-font xwing-miniatures-font-config"></i>')
            .replace(/%LINEBREAK%/g, '<br /><br />')

exportObj.canonicalizeShipNames = (card_data) ->
    for ship_name, ship_data of card_data.ships
        ship_data.canonical_name ?= ship_data.name.canonicalize()

exportObj.renameShip = (name, new_name) ->
    exportObj.ships[name].display_name = new_name

exportObj.randomizer = (faction_name, points) ->
    shiplistmaster = exportObj.basicCardData #export ship database
    listcount = 0 #start count at 0
    #for shiplistmaster in shiplistmaster.pilotsbyid.faction == faction_name loop grab pilots by faction
        #if Math.random() >= 0.9
        #append.shiplistmaster.pilotsbyid.xws ? shiplistmaster.pilotsbyid.canonical_name ? shiplistmaster.pilotsbyid.name.canonicalize())

exportObj.hyperspaceShipInclusions = [
    {name: 'X-Wing', faction: 'Rebel Alliance'},
    {name: 'YT-1300', faction: 'Rebel Alliance'},
    {name: 'B-Wing', faction: 'Rebel Alliance'},
    {name: 'A-Wing', faction: 'Rebel Alliance'},
    {name: 'Y-Wing', faction: 'Rebel Alliance'},
    {name: 'VCX-100', faction: 'Rebel Alliance'},
    {name: 'Sheathipede-Class Shuttle', faction: 'Rebel Alliance'},
    {name: 'TIE Advanced', faction: 'Galactic Empire'},
    {name: 'TIE Advanced Prototype', faction: 'Galactic Empire'},
    {name: 'TIE Fighter', faction: 'Galactic Empire'},
    {name: 'TIE Interceptor', faction: 'Galactic Empire'},
    {name: 'TIE Reaper', faction: 'Galactic Empire'},
    {name: 'TIE Striker', faction: 'Galactic Empire'},
    {name: 'VT-49 Decimator', faction: 'Galactic Empire'},
    {name: 'Firespray-31', faction: 'Scum and Villainy'},
    {name: 'Mining Guild TIE Fighter', faction: 'Scum and Villainy'},
    {name: 'Fang Fighter', faction: 'Scum and Villainy'},
    {name: 'JumpMaster 5000', faction: 'Scum and Villainy'},
    {name: 'M3-A Interceptor', faction: 'Scum and Villainy'},
    {name: 'Customized YT-1300', faction: 'Scum and Villainy'},
    {name: 'Escape Craft', faction: 'Scum and Villainy'},
    {name: 'YV-666', faction: 'Scum and Villainy'},
    {name: 'Z-95 Headhunter', faction: 'Scum and Villainy'},
    {name: 'Fireball', faction: 'Resistance'},
    {name: 'T-70 X-Wing', faction: 'Resistance'},
    {name: 'RZ-2 A-Wing', faction: 'Resistance'},
    {name: 'Resistance Transport', faction: 'Resistance'},
    {name: 'Resistance Transport Pod', faction: 'Resistance'},
    {name: 'TIE/Ba Interceptor', faction: 'First Order'},
    {name: 'TIE/FO Fighter', faction: 'First Order'},
    {name: 'TIE/VN Silencer', faction: 'First Order'},
    {name: 'TIE/SF Fighter', faction: 'First Order'},
    {name: 'Delta-7 Aethersprite', faction: 'Galactic Republic'},
    {name: 'ARC-170', faction: 'Galactic Republic'},
    {name: 'Naboo Royal N-1 Starfighter', faction: 'Galactic Republic'},
    {name: 'BTL-B Y-Wing', faction: 'Galactic Republic'},
    {name: 'V-19 Torrent', faction: 'Galactic Republic'},
    {name: 'Vulture-class Droid Fighter', faction: 'Separatist Alliance'},
    {name: 'Hyena-Class Droid Bomber', faction: 'Separatist Alliance'},
    {name: 'Sith Infiltrator', faction: 'Separatist Alliance'},
    {name: 'Nantex-Class Starfighter', faction: 'Separatist Alliance'}
    {name: 'Belbullab-22 Starfighter', faction: 'Separatist Alliance'}
]

# Used to exclude pilots from included ships
exportObj.hyperspacePilotExclusions = [

    # Rebel Alliance
    'Wedge Antilles',
    'Biggs Darklighter',
    'Kullbee Sperado',
    'Leevan Tenza',
    'Edrio Two Tubes',
    'Cavern Angels Zealot',
    'Outer Rim Smuggler',
    '"Chopper"',
    'Lothal Rebel',
    'Fenn Rau (Sheathipede)',
    'AP-5',

    # Galactic Empire
    '"Wampa"',
    '"Howlrunner"',
    '"Night Beast"',
    '"Wampa"',
    'Valen Rudor',
    'Scarif Base Pilot',
    'Patrol Leader',
    'Grand Inquisitor',
    'Inquisitor',
    'Soontir Fel',

    # Scum and Villainy
    'Old Teroch',
    'Foreman Proach',
    'Captain Seevor',
    'Lando Calrissian (Scum)',
    'Freighter Captain',
    'Outer Rim Pioneer',
    'L3-37 (Escape Craft)',
    'Autopilot Drone',
    'Moralo Eval',
    'Trandoshan Slaver',
    'Binayre Pirate',

    # Resistance
    'Finn',
    "L'ulo L'ampar",

    # FO
    '"Quickdraw"',
    
    # Galactic Republic
    '"Sinker"',
    '104th Battalion Pilot',
    'Anakin Skywalker',
    'Mace Windu',
    'Saesee Tiin',
    '"Kickback"',
    '"Axe"',
    'Gold Squadron Trooper',

    # Separatist Alliance
    'Dark Courier',
    'Captain Sear'

]

# Upgrades in that are not in Hyperspace
exportObj.hyperspaceUpgradeExclusions = [
    # Rebel Alliance
    'Jyn Erso',
    'Bistan',
    'Ezra Bridger',
    '"Chopper" (Astromech)',
    'Pivot Wing',
    'Baze Malbus',
    'Cassian Andor',
    'Hera Syndulla',
    'Magva Yarro',
    'R2-D2 (Crew)',
    'Saw Gerrera',
    'Han Solo',
    'Luke Skywalker',

    # Galactic Empire
    'Admiral Sloane',
    'Ciena Ree',
    'Darth Vader',
    'Grand Moff Tarkin',
    'Minister Tua',
    'Moff Jerjerrod',
    'ISB Slicer',
    'Emperor Palpatine',

    # Scum and Villainy
    '"Genius"',
    'R5-TK',
    '4-LOM',
    'Cad Bane',
    'Cikatro Vizago',
    'IG-88D',
    'Ketsu Onyo',
    'Unkar Plutt',
    'Zuckuss',
    'Jabba the Hutt',
    'Greedo',
    'Chewbacca (Scum)',
    'L3-37',
    'Lando Calrissian (Scum)',
    "Qi'ra",
    'Tobias Beckett',
    'Han Solo (Scum)',
    "Marauder",
    'Virago',

    # Resistance
    'M9-G8',
    'C-3PO (Resistance)',
    'Chewbacca (Resistance)',
    'GA-97',
    'Han Solo (Resistance)',
    'Rose Tico',
    'Finn',
    'Rey',
    'Paige Tico',
    "Rey's Millennium Falcon",

    # FO
    'Captain Phasma',
    'General Hux',
    'Kylo Ren',
    'Petty Officer Thanisson',
    'Supreme Leader Snoke',
    'Biohexacrypt Codes',
    'Hyperspace Tracking Data',

    # Galactic Republic
    'C1-10P',
    'R2-A6',
    'R2-C4',
    'R4-P44',
    'Delta-7B',
    'Chancellor Palpatine',
    'Ahsoka Tano',
    'Clone Commander Cody',

    # Separatist Alliance
    'Chancellor Palpatine',
    'Energy-Shell Charges',
    'Impervium Plating',
    'Ensnare',

    # Generic
    'Jamming Beam',
    'Heavy Laser Cannon',
    'GNK "Gonk" Droid',
    'Seasoned Navigator',
    'Bomblet Generator',
    'Electro-Proton Bomb',
    'Proximity Mines',
    'Hate',
    'Precognitive Reflexes',
    'Sense',
    'Supernatural Reflexes',
    'Freelance Slicer',
    'Cloaking Device',
    'Feedback Array',
    'Ablative Plating',
    'Debris Gambit',
    'Saturation Salvo',
    'Hotshot Gunner',
    'Skilled Bombardier',
    'Veteran Turret Gunner',
    'Feedback Array',
    'Barrage Rockets',
    'Cluster Missiles',
    'Homing Missiles',
    'Proton Rockets',
    'Afterburners',
    'Electronic Baffle',
    'Shield Upgrade',
    'Static Discharge Vanes',
    'Stealth Device',
    'Tactical Scrambler',
    'Advanced Sensors',
    'Collision Detector',
    'Trajectory Simulator',
    'Composure',
    'Crack Shot',
    'Elusive',
    'Juke',
    'Lone Wolf',
    'Predator',
    'Swarm Tactics',
    'Trick Shot',
    'Pattern Analyzer',
    'Ion Torpedoes'
]

exportObj.epicExclusionsList = [
    'CR90 Corellian Corvette',
    'Raider-class Corvette',
    'GR-75 Medium Transport',
    'Gozanti-class Cruiser',
    'C-ROC Cruiser'
]


exportObj.epicExclusions = (data) ->
    if data.ship? and (data.ship in exportObj.epicExclusionsList)
        return false
    else if data.slot? and (data.slot == "Command")
        return false
    else
        return true

# Ships/Pilots excluded unless in the included list (with further excluded pilots list for included ships, i.e u-wing)
# while upgrades assumed included unless on the excluded list
exportObj.hyperspaceCheck = (data, faction='', shipCheck=false) ->
    # check ship/pilot first
    if (shipCheck)
        if (data.name in exportObj.hyperspacePilotExclusions)
            return false
        for ship in exportObj.hyperspaceShipInclusions
            # checks against name for ship itself or ship name/faction for pilot inclusions
            if (ship.faction == faction && (data.name == ship.name || data.ship == ship.name || (Array.isArray(data.ship) and ship.name in data.ship)))
                return true
        return false
    else
        return data.name not in exportObj.hyperspaceUpgradeExclusions

exportObj.codeToLanguage ?= {}
exportObj.codeToLanguage.en = 'English'

exportObj.translations ?= {}
# This is here mostly as a template for other languages.
exportObj.translations.English =
    sloticon:
        "Astromech": '<i class="xwing-miniatures-font xwing-miniatures-font-astromech"></i>'
        "Force": '<i class="xwing-miniatures-font xwing-miniatures-font-forcepower"></i>'
        "Bomb": '<i class="xwing-miniatures-font xwing-miniatures-font-bomb"></i>'
        "Cannon": '<i class="xwing-miniatures-font xwing-miniatures-font-cannon"></i>'
        "Crew": '<i class="xwing-miniatures-font xwing-miniatures-font-crew"></i>'
        "Talent": '<i class="xwing-miniatures-font xwing-miniatures-font-talent"></i>'
        "Missile": '<i class="xwing-miniatures-font xwing-miniatures-font-missile"></i>'
        "Sensor": '<i class="xwing-miniatures-font xwing-miniatures-font-sensor"></i>'
        "Torpedo": '<i class="xwing-miniatures-font xwing-miniatures-font-torpedo"></i>'
        "Turret": '<i class="xwing-miniatures-font xwing-miniatures-font-turret"></i>'
        "Illicit": '<i class="xwing-miniatures-font xwing-miniatures-font-illicit"></i>'
        "Configuration": '<i class="xwing-miniatures-font xwing-miniatures-font-configuration"></i>'
        "Modification": '<i class="xwing-miniatures-font xwing-miniatures-font-modification"></i>'
        "Gunner": '<i class="xwing-miniatures-font xwing-miniatures-font-gunner"></i>'
        "Device": '<i class="xwing-miniatures-font xwing-miniatures-font-device"></i>'
        "Tech": '<i class="xwing-miniatures-font xwing-miniatures-font-tech"></i>'
        "Title": '<i class="xwing-miniatures-font xwing-miniatures-font-title"></i>'
        "Hardpoint": '<i class="xwing-miniatures-font xwing-miniatures-font-hardpoint"></i>'
        "Team": '<i class="xwing-miniatures-font xwing-miniatures-font-team"></i>'
        "Cargo": '<i class="xwing-miniatures-font xwing-miniatures-font-cargo"></i>'
        "Command": '<i class="xwing-miniatures-font xwing-miniatures-font-command"></i>'
        "HardpointShip": '<i class="xwing-miniatures-font xwing-miniatures-font-hardpoint"></i>'
        "Tactical Relay": '<i class="xwing-miniatures-font xwing-miniatures-font-tacticalrelay"></i>'

    slot:
        "Astromech": "Astromech"
        "Force": "Force"
        "Bomb": "Bomb"
        "Cannon": "Cannon"
        "Crew": "Crew"
        "Missile": "Missile"
        "Sensor": "Sensor"
        "Torpedo": "Torpedo"
        "Turret": "Turret"
        "HardpointShip": "Hardpoint"
        "Hardpoint": "Hardpoint"
        "Illicit": "Illicit"
        "Configuration": "Configuration"
        "Talent": "Talent"
        "Modification": "Modification"
        "Gunner": "Gunner"
        "Device": "Payload"
        "Tech": "Tech"
        "Title": "Title"
        "Tactical Relay": "Tactical Relay"
    
    sources: # needed?
        "Second Edition Core Set": "Second Edition Core Set"
        "Rebel Alliance Conversion Kit": "Rebel Alliance Conversion Kit"
        "Galactic Empire Conversion Kit": "Galactic Empire Conversion Kit"
        "Scum and Villainy Conversion Kit": "Scum and Villainy Conversion Kit"
        "T-65 X-Wing Expansion Pack": "T-65 X-Wing Expansion Pack"
        "BTL-A4 Y-Wing Expansion Pack": "BTL-A4 Y-Wing Expansion Pack"
        "TIE/ln Fighter Expansion Pack": "TIE/ln Fighter Expansion Pack"
        "TIE Advanced x1 Expansion Pack": "TIE Advanced x1 Expansion Pack"
        "Slave 1 Expansion Pack": "Slave 1 Expansion Pack"
        "Fang Fighter Expansion Pack": "Fang Fighter Expansion Pack"
        "Lando's Millennium Falcon Expansion Pack": "Lando's Millennium Falcon Expansion Pack"
        "Saw's Renegades Expansion Pack": "Saw's Renegades Expansion Pack"
        "TIE Reaper Expansion Pack": "TIE Reaper Expansion Pack"
    ui:
        shipSelectorPlaceholder: "Select a ship"
        pilotSelectorPlaceholder: "Select a pilot"
        upgradePlaceholder: (translator, language, slot) ->
            "No #{translator language, 'slot', slot} Upgrade"
        modificationPlaceholder: "No Modification"
        titlePlaceholder: "No Title"
        upgradeHeader: (translator, language, slot) ->
            "#{translator language, 'slot', slot} Upgrade"
        unreleased: "unreleased"
        epic: "epic"
        limited: "limited"
    byCSSSelector:
        # Warnings
        '.unreleased-content-used .translated': 'This squad uses unreleased content!'
        '.loading-failed-container .translated': 'It appears that you followed a broken link. No squad could be loaded!'
        '.collection-invalid .translated': 'You cannot field this list with your collection!'
        '.ship-number-invalid-container .translated': 'A tournament legal squad must contain 2-8 ships!'
        # Type selector
        '.game-type-selector option[value="standard"]': 'Extended'
        '.game-type-selector option[value="hyperspace"]': 'Hyperspace'
        '.game-type-selector option[value="custom"]': 'Custom'
        # Card browser
        '.xwing-card-browser option[value="name"]': 'Name'
        '.xwing-card-browser option[value="source"]': 'Source'
        '.xwing-card-browser option[value="type-by-points"]': 'Type (by Points)'
        '.xwing-card-browser option[value="type-by-name"]': 'Type (by Name)'
        '.xwing-card-browser .translate.select-a-card': 'Select a card from the list at the left.'
        '.xwing-card-browser .translate.sort-cards-by': 'Sort cards by'
        # Info well
        '.info-well .info-ship td.info-header': 'Ship'
        '.info-well .info-skill td.info-header': 'Initiative'
        '.info-well .info-actions td.info-header': 'Actions'
        '.info-well .info-upgrades td.info-header': 'Upgrades'
        '.info-well .info-range td.info-header': 'Range'
        '.info-well .info-sources.info-header': 'Sources'
        # Squadron edit buttons
        '.clear-squad' : '<i class="fa fa-plus-circle"></i>&nbsp;New Squad'
        '.save-list' : '<i class="far fa-save"></i>&nbsp;Save'
        '.save-list-as' : '<i class="far fa-file"></i>&nbsp;Save as…'
        '.delete-list' : '<i class="fa fa-trash"></i>&nbsp;Delete'
        '.backend-list-my-squads' : '<i class="fa fa-download"></i>&nbsp;Load Squad'
        '.view-as-text' : '<span class="d-none d-lg-block"><i class="fa fa-print"></i>&nbsp;Print/View as Text</span><span class="d-lg-none"><i class="fa fa-print"></i></span>'
        '.collection': '<span class="d-none d-lg-block"><i class="fa fa-folder-open"></i> Your Collection</span><span class="d-lg-none"><i class="fa fa-folder-open"></i></span>'
        '.randomize' : '<span class="d-none d-lg-block"><i class="fa fa-random"></i> Randomize!</span><span class="d-lg-none"><i class="fa fa-random"></i></span>'
        '.randomize-options' : 'Randomizer options…'
        '.notes-container .notes-name' : 'Squad Notes:'
        '.notes-container .tag-name' : 'Tag:'
        # Print/View modal
        '.bbcode-list' : 'Copy the BBCode below and paste it into your forum post.<textarea></textarea><button class="btn btn-copy">Copy</button>'
        '.html-list' : '<textarea></textarea><button class="btn btn-copy">Copy</button>'
        '.vertical-space-checkbox' : """Add space for cards <input type="checkbox" class="toggle-vertical-space" />"""
        '.color-print-checkbox' : """Print color <input type="checkbox" class="toggle-color-print" checked="checked" />"""
        '.print-list' : '<i class="fa fa-print"></i>&nbsp;Print'
        # Randomizer options
        '.do-randomize' : 'Randomize!'
        # Top tab bar
        '#browserTab' : 'Card Browser'
        '#aboutTab' : 'About'
        # Obstacles
        '.choose-obstacles' : '<i class="fa fa-cloud"></i>&nbsp;Choose Obstacles'
        '.choose-obstacles-description' : 'Choose up to three obstacles to include in the permalink for use in external programs. (Support for displaying which obstacles were selected in the printout is not yet supported.)'
        '.coreasteroid0-select' : 'Core Asteroid 0'
        '.coreasteroid1-select' : 'Core Asteroid 1'
        '.coreasteroid2-select' : 'Core Asteroid 2'
        '.coreasteroid3-select' : 'Core Asteroid 3'
        '.coreasteroid4-select' : 'Core Asteroid 4'
        '.coreasteroid5-select' : 'Core Asteroid 5'
        '.yt2400debris0-select' : 'YT2400 Debris 0'
        '.yt2400debris1-select' : 'YT2400 Debris 1'
        '.yt2400debris2-select' : 'YT2400 Debris 2'
        '.vt49decimatordebris0-select' : 'VT49 Debris 0'
        '.vt49decimatordebris1-select' : 'VT49 Debris 1'
        '.vt49decimatordebris2-select' : 'VT49 Debris 2'
        '.core2asteroid0-select' : 'Force Awakens Asteroid 0'
        '.core2asteroid1-select' : 'Force Awakens Asteroid 1'
        '.core2asteroid2-select' : 'Force Awakens Asteroid 2'
        '.core2asteroid3-select' : 'Force Awakens Asteroid 3'
        '.core2asteroid4-select' : 'Force Awakens Asteroid 4'
        '.core2asteroid5-select' : 'Force Awakens Asteroid 5'
        # Collection

    singular:
        'pilots': 'Pilot'
        'modifications': 'Modification'
        'titles': 'Title'
        'ships' : 'Ship'
    types:
        'Pilot': 'Pilot'
        'Modification': 'Modification'
        'Title': 'Title'
        'Ship': 'Ship'
    rulestypes:
        'glossary': 'Glossary'
        'faq': 'FAQ'

exportObj.cardLoaders ?= {}
exportObj.cardLoaders.English = () ->
    exportObj.cardLanguage = 'English'

    exportObj.renameShip """YT-1300""", """Modified YT-1300 Light Freighter"""
    exportObj.renameShip """StarViper""", """StarViper-class Attack Platform"""
    exportObj.renameShip """Scurrg H-6 Bomber""", """Scurrg H-6 Bomber"""
    exportObj.renameShip """YT-2400""", """YT-2400 Light Freighter"""
    exportObj.renameShip """Auzituck Gunship""", """Auzituck Gunship"""
    exportObj.renameShip """Kihraxz Fighter""", """Kihraxz Fighter"""
    exportObj.renameShip """Sheathipede-Class Shuttle""", """Sheathipede-class Shuttle"""
    exportObj.renameShip """Quadjumper""", """Quadrijet Transfer Spacetug"""
    exportObj.renameShip """Firespray-31""", """Firespray-class Patrol Craft"""
    exportObj.renameShip """TIE Fighter""", """TIE/ln Fighter"""
    exportObj.renameShip """Y-Wing""", """BTL-A4 Y-Wing"""
    exportObj.renameShip """TIE Advanced""", """TIE Advanced x1"""
    exportObj.renameShip """Alpha-Class Star Wing""", """Alpha-class Star Wing"""
    exportObj.renameShip """U-Wing""", """UT-60D U-Wing"""
    exportObj.renameShip """TIE Striker""", """TIE/sk Striker"""
    exportObj.renameShip """B-Wing""", """A/SF-01 B-Wing"""
    exportObj.renameShip """TIE Defender""", """TIE/D Defender"""
    exportObj.renameShip """TIE Bomber""", """TIE/sa Bomber"""
    exportObj.renameShip """TIE Punisher""", """TIE/ca Punisher"""
    exportObj.renameShip """Aggressor""", """Aggressor Assault Fighter"""
    exportObj.renameShip """G-1A Starfighter""", """G-1A Starfighter"""
    exportObj.renameShip """VCX-100""", """VCX-100 Light Freighter"""
    exportObj.renameShip """YV-666""", """YV-666 Light Freighter"""
    exportObj.renameShip """TIE Advanced Prototype""", """TIE Advanced v1"""
    exportObj.renameShip """Lambda-Class Shuttle""", """Lambda-class T-4a Shuttle"""
    exportObj.renameShip """TIE Phantom""", """TIE/ph Phantom"""
    exportObj.renameShip """VT-49 Decimator""", """VT-49 Decimator"""
    exportObj.renameShip """TIE Aggressor""", """TIE/ag Aggressor"""
    exportObj.renameShip """K-Wing""", """BTL-S8 K-Wing"""
    exportObj.renameShip """ARC-170""", """ARC-170 Starfighter"""
    exportObj.renameShip """Attack Shuttle""", """Attack Shuttle"""
    exportObj.renameShip """X-Wing""", """T-65 X-Wing"""
    exportObj.renameShip """HWK-290""", """HWK-290 Light Freighter"""
    exportObj.renameShip """A-Wing""", """RZ-1 A-Wing"""
    exportObj.renameShip """Fang Fighter""", """Fang Fighter"""
    exportObj.renameShip """Z-95 Headhunter""", """Z-95-AF4 Headhunter"""
    exportObj.renameShip """M12-L Kimogila Fighter""", """M12-L Kimogila Fighter"""
    exportObj.renameShip """E-Wing""", """E-Wing"""
    exportObj.renameShip """TIE Interceptor""", """TIE Interceptor"""
    exportObj.renameShip """Lancer-Class Pursuit Craft""", """Lancer-class Pursuit Craft"""
    exportObj.renameShip """TIE Reaper""", """TIE Reaper"""
    exportObj.renameShip """M3-A Interceptor""", """M3-A Interceptor"""
    exportObj.renameShip """JumpMaster 5000""", """JumpMaster 5000"""
    exportObj.renameShip """Customized YT-1300""", """Customized YT-1300 Light Freighter"""
    exportObj.renameShip """Escape Craft""", """Escape Craft"""
    exportObj.renameShip """TIE/FO Fighter""", """TIE/FO Fighter"""
    exportObj.renameShip """TIE/SF Fighter""", """TIE/SF Fighter"""
    exportObj.renameShip """Upsilon-Class Command Shuttle""", """Upsilon-Class Command Shuttle"""
    exportObj.renameShip """TIE/VN Silencer""", """TIE/vn Silencer"""
    exportObj.renameShip """T-70 X-Wing""", """T-70 X-Wing"""
    exportObj.renameShip """RZ-2 A-Wing""", """RZ-2 A-Wing"""
    exportObj.renameShip """MG-100 StarFortress""", """MG-100 StarFortress"""
    exportObj.renameShip """Mining Guild TIE Fighter""", """Mining Guild TIE Fighter"""
    exportObj.renameShip """Scavenged YT-1300""", """Scavenged YT-1300"""


    pilot_translations =
        "0-66":
           display_name: """0-66"""
           text: """After you defend, you may spend 1 calculate token to perform an action."""
        "104th Battalion Pilot":
           display_name: """104th Battalion Pilot"""
           text: """<i class = flavor_text>The ARC-170 was designed as a dominating heavy escort fighter with powerful front and rear lasers, ordnance, and an astromech for navigation. Squadrons of these mighty ships bolster the Republic Navy’s presence at any battle where they are deployed.</i>"""
        "4-LOM":
           display_name: """4-LOM"""
           text: """After you fully execute a red maneuver, gain 1 calculate token.%LINEBREAK%At the start of the End Phase, you may choose 1 ship at range 0-1. If you do, transfer 1 of your stress tokens to that ship."""
        "Nashtah Pup":
           display_name: """Nashtah Pup"""
           text: """You can deploy only via emergency deployment, and you have the name, initiative, pilot ability, and ship %CHARGE% of the friendly, destroyed <strong>Hound’s Tooth</strong>.%LINEBREAK%<strong>Escape Craft:</strong> <strong>Setup:</strong>Requires the <strong>Hound’s Tooth</strong>. You <b>must</b> begin the game docked with the <strong>Hound’s Tooth</strong>."""
        "AP-5":
           display_name: """AP-5"""
           text: """While you coordinate, if you chose a ship with exactly 1 stress token, it can perform actions.%LINEBREAK%<strong>Comms Shuttle:</strong> While you are docked, your carrier ship gains %COORDINATE%. Before your carrier ship activates, it may perform a %COORDINATE% action. """
        "Academy Pilot":
           display_name: """Academy Pilot"""
           text: """<i class = flavor_text>The Galactic Empire uses the fast and agile TIE/ln, developed by Sienar Fleet Systems and produced in staggering quantity, as its primary starfighter.</i>"""
        "Ahhav":
           display_name: """Ahhav"""
           text: """While you defend or perform an attack, if the enemy ship is a larger size than you, roll 1 additional die.%LINEBREAK%<strong>Notched Stabilizers:</strong> While you move, you ignore asteroids."""
        "Ahsoka Tano":
           display_name: """Ahsoka Tano"""
           text: """After you fully execute a maneuver, you may choose a friendly ship at range&nbsp;0-1 and spend 1&nbsp;%FORCE%. That ship may perform an action, even if it is stressed.%LINEBREAK%<strong>Fine-tuned Controls:</strong> After you fully execute a maneuver, you may spend 1&nbsp;%FORCE% to perform a %BOOST% or %BARRELROLL% action."""
        "Airen Cracken":
           display_name: """Airen Cracken"""
           text: """After you perform an attack, you may choose 1 friendly ship at range 1. That ship may perform an action, treating it as red."""
        "Alpha Squadron Pilot":
           display_name: """Alpha Squadron Pilot"""
           text: """<i class = flavor_text>Sienar Fleet Systems designed the TIE interceptor with four wing-mounted laser cannons, a dramatic increase in firepower over its predecessors.</i>%LINEBREAK%<strong>Autothrusters:</strong> After you perform an action, you may perform a red %BARRELROLL% or red %BOOST% action."""
        "Anakin Skywalker":
           display_name: """Anakin Skywalker"""
           text: """After you fully execute a maneuver, if there is an enemy ship in your %FRONTARC% at range&nbsp;0-1 or in your %BULLSEYEARC%, you may spend 1 %FORCE% to remove 1&nbsp;stress token.%LINEBREAK%<strong>Fine-tuned Controls:</strong> After you fully execute a maneuver, you may spend 1&nbsp;%FORCE% to perform a %BOOST% or %BARRELROLL% action."""
        "Anakin Skywalker (N-1 Starfighter)":
           text: """Before you reveal your maneuver, you may spend 1 %FORCE% to barrel roll (this is not an action): %LINEBREAK%<strong>Full Throttle:</strong> After you fully execute a speed 3-5 maneuver, you may perform an %EVADE% action."""
        "Arvel Crynyd":
           display_name: """Arvel Crynyd"""
           text: """You can perform primary attacks at range 0.%LINEBREAK%If you would fail a %BOOST% action by overlapping another ship, resolve it as though you were partially executing a maneuver instead.%LINEBREAK%<strong>Vectored Thrusters:</strong> After you perform an action, you may perform a red %BOOST% action."""
        "Asajj Ventress":
           display_name: """Asajj Ventress"""
           text: """At the start of the Engagement Phase, you may choose 1 enemy ship in your %SINGLETURRETARC% at range 0-2 and spend 1&nbsp;%FORCE%. If you do, that ship gains 1 stress token unless it removes 1 green token."""
        "Autopilot Drone":
           display_name: """Autopilot Drone"""
           text: """<i class = flavor_text>Sometimes, manufacturer’s warnings are made to be broken.</i>%LINEBREAK%<strong>Rigged Energy Cells:</strong> During the System Phase, if you are not docked, lose 1&nbsp;%CHARGE%. At the end of the Activation Phase, if you have 0 %CHARGE%, you are destroyed. Before you are removed, each ship at range 0-1 suffers 1&nbsp;%CRIT% damage."""
        "Bandit Squadron Pilot":
           display_name: """Bandit Squadron Pilot"""
           text: """<i class = flavor_text>The Z-95 Headhunter was the primary inspiration for Incom Corporation’s exemplary T-65 X-wing starfighter. Though it is considered outdated by modern standards, it remains a versatile and potent snub fighter.</i>"""
        "Baktoid Prototype":
           display_name: """Baktoid Prototype"""
           text: """While you perform a special attack, if a friendly ship with the <strong>Networked Calculations</strong> ship ability has a lock on the defender, you may ignore the %FOCUS%, %CALCULATE% or %LOCK% requirement of that attack. %LINEBREAK%<strong>Networked Calculations:</strong> While you defend or perform an attack, you may spend 1 calculate token from a friendly ship at range&nbsp;0-1 to change 1&nbsp;%FOCUS% result to an %EVADE% or %HIT% result."""
        "Baron of the Empire":
           display_name: """Baron of the Empire"""
           text: """<i class = flavor_text>Sienar Fleet System’s TIE Advanced v1 is a groundbreaking starfighter design, featuring upgraded engines, a missile launcher, and folding s-foils.</i>"""
        "Barriss Offee":
           display_name: """Barriss Offee"""
           text: """While a friendly ship at range&nbsp;0-2 performs an attack, if the defender is in its %BULLSEYEARC%, you may spend 1&nbsp;%FORCE% to change 1&nbsp;%FOCUS% result to a %HIT% result or 1&nbsp;%HIT% result to a %CRIT% result.%LINEBREAK%<strong>Fine-tuned Controls:</strong> After you fully execute a maneuver, you may spend 1 %FORCE% to perform a %BOOST% or %BARRELROLL% action."""
        "Ben Teene":
           display_name: """Ben Teene"""
           text: """After you perform an attack, if the defender is in your %SINGLETURRETARC%, assign the <strong>Rattled</strong> condition to the defender."""
        "Benthic Two Tubes":
           display_name: """Benthic Two Tubes"""
           text: """After you perform a %FOCUS% action, you may transfer 1 of your focus tokens to a friendly ship at range 1-2."""
        "Biggs Darklighter":
           display_name: """Biggs Darklighter"""
           text: """While another friendly ship at range 0-1 defends, before the Neutralize Results step, if you are in the attack arc, you may suffer 1&nbsp;%HIT% or %CRIT% to cancel 1 matching result."""
        "Binayre Pirate":
           display_name: """Binayre Pirate"""
           text: """<i class = flavor_text>Operating from the Double Worlds, Talus and Tralus, Kath Scarlet’s gang of smugglers and pirates would never be described as reputable or dependable—even by other criminals.</i>"""
        "Black Squadron Ace":
           display_name: """Black Squadron Ace"""
           text: """<i class = flavor_text>The elite TIE/ln pilots of Black Squadron accompanied Darth Vader on a devastating strike against the Rebel forces at the Battle of Yavin.</i>"""
        "Black Squadron Scout":
           display_name: """Black Squadron Scout"""
           text: """<i class = flavor_text>These heavily armed atmospheric craft employ their specialized moveable wings to gain additional speed and maneuverability.</i>%LINEBREAK% <sasmall><strong>Adaptive Ailerons:</strong> Before you reveal your dial, if you are not stressed, you <b>must</b> execute a white [1&nbsp;%BANKLEFT%], [1&nbsp;%STRAIGHT%], or [1&nbsp;%BANKRIGHT%] maneuver.</sasmall>"""
        "Black Squadron Ace (T-70)":
           display_name: """Black Squadron Ace"""
           text: """<i class = flavor_text>During the Cold War, Poe Dameron’s Black Squadron conducted daring covert operations against the First Order in defiance of treaties ratified by the New Republic Senate.</i>%LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1&nbsp;%CANNON%, %TORPEDO%, or %MISSILE% upgrade."""
        "Black Squadron Scout":
           display_name: """Black Squadron Scout"""
           text: """<i class = flavor_text>These heavily armed atmospheric craft employ their specialized moveable wings to gain additional speed and maneuverability.</i>%LINEBREAK% <strong>Adaptive Ailerons:</strong> Before you reveal your dial, if you are not stressed, you <b>must</b> execute a white [1&nbsp;%BANKLEFT%], [1&nbsp;%STRAIGHT%], or [1&nbsp;%BANKRIGHT%] maneuver."""
        "Black Sun Ace":
           display_name: """Black Sun Ace"""
           text: """<i class = flavor_text>The Kihraxz assault fighter was developed specifically for the Black Sun crime syndicate, whose highly paid ace pilots demanded a nimble, powerful ship to match their skills.</i>"""
        "Black Sun Assassin":
           display_name: """Black Sun Assassin"""
           text: """<i class = flavor_text>Although assassinations can be handled with a shot in the dark or a dire substance added to a drink, a flaming shuttle tumbling from the sky sends a special kind of message.</i> %LINEBREAK% <strong>Microthrusters:</strong> While you perform a barrel roll, you <b>must</b> use the %BANKLEFT% or %BANKRIGHT% template instead of the %STRAIGHT% template."""
        "Black Sun Enforcer":
           display_name: """Black Sun Enforcer"""
           text: """<i class = flavor_text>Prince Xizor himself collaborated with MandalMotors to design the StarViper-class attack platform, one of the most formidable starfighters in the galaxy.</i> %LINEBREAK% <strong>Microthrusters:</strong> While you perform a barrel roll, you <b>must</b> use the %BANKLEFT% or %BANKRIGHT% template instead of the %STRAIGHT% template."""
        "Black Sun Soldier":
           display_name: """Black Sun Soldier"""
           text: """<i class = flavor_text>The vast and influential Black Sun crime syndicate can always find a use for talented pilots, provided they aren’t particular about how they earn their credits.</i>"""
        "Blade Squadron Veteran":
           display_name: """Blade Squadron Veteran"""
           text: """<i class = flavor_text>A unique gyrostabilization system surrounds the B-wing’s cockpit, ensuring that the pilot always remains stationary during flight.</i>"""
        "Blue Squadron Escort":
           display_name: """Blue Squadron Escort"""
           text: """<i class = flavor_text>Designed by Incom Corporation, the T-65 X-wing quickly proved to be one of the most effective and versatile military vehicles in the galaxy and a boon to the Rebellion.</i>"""
        "Blue Squadron Pilot":
           display_name: """Blue Squadron Pilot"""
           text: """<i class = flavor_text>Due to its heavy weapons array and resilient shielding, the B-wing has solidified itself as the Rebel Alliance’s most innovative assault fighter.</i>"""
        "Blue Squadron Protector":
           display_name: """Blue Squadron Protector"""
           text: """<i class = flavor_text>Blue Squadron’s elite clone pilots are trained to fly their V-19s in conjunction with Jedi and often support famous commanders such as Anakin Skywalker and Ahsoka Tano.</i>"""
        "Blue Squadron Recruit":
           display_name: """Blue Squadron Recruit"""
           text: """<i class = flavor_text>Young beings across the galaxy have grown up on tales of heroism in the Galactic Civil War, and many learned to fly in the same cockpits from which their parents fought the Empire.</i>%LINEBREAK%<strong>Refined Gyrostabilizers:</strong> You can rotate your %SINGLETURRETARC% indicator only to your %FRONTARC% or %REARARC%. After you perform an action, you may perform a red %BOOST% or red %ROTATEARC% action."""
        "Blue Squadron Rookie":
           display_name: """Blue Squadron Rookie"""
           text: """<i class = flavor_text>The Incom-FreiTek T-70 X-Wing was designed to improve upon the tactical flexibility of the venerable T-65. The starfighter’s advanced droid socket is compatible with a wide array of astromechs, and its modular weapons pods allow ground crews to tailor its payload for specific missions.</i>%LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1&nbsp;%CANNON%, %TORPEDO%, or %MISSILE% upgrade."""
        "Blue Squadron Scout":
           display_name: """Blue Squadron Scout"""
           text: """<i class = flavor_text>Used for deploying troops under the cover of darkness or into the heat of battle, the UT-60D U-wing fulfills the Rebellion’s need for a swift and hardy troop transport.</i>"""
        "Boba Fett":
           display_name: """Boba Fett"""
           text: """While you defend or perform an attack, you may reroll 1 of your dice for each enemy ship at range 0-1."""
        "Bodhi Rook":
           display_name: """Bodhi Rook"""
           text: """Friendly ships can acquire locks onto objects at range 0-3 of any friendly ship."""
        "Bossk":
           display_name: """Bossk"""
           text: """While you perform a primary attack, after the Neutralize Results step, you may spend 1&nbsp;%CRIT% result to add 2&nbsp;%HIT% results."""
        "Bounty Hunter":
           display_name: """Bounty Hunter"""
           text: """<i class = flavor_text>The Firespray-class patrol craft is infamous for its association with the deadly bounty hunters Jango Fett and Boba Fett, who packed their craft with countless deadly armaments.</i>"""
        "Braylen Stramm":
           display_name: """Braylen Stramm"""
           text: """While you defend or perform an attack, if you are stressed, you may reroll up to 2 of your dice."""
        "Captain Cardinal":
           display_name: """Captain Cardinal"""
           text: """While a friendly ship at range 1-2 with lower initiative than you defends or performs an attack, if you have at least 1&nbsp;%CHARGE%, that ship may reroll 1 %FOCUS% result.%LINEBREAK%After an enemy ship at range 0-3 is destroyed, lose 1&nbsp;%CHARGE%.%LINEBREAK%<strong>Linked Battery:</strong> While you perform a %CANNON% attack, roll 1 additional die."""
        "Captain Feroph":
           display_name: """Captain Feroph"""
           text: """While you defend, if the attacker does not have any green tokens, you may change 1 of your blank or %FOCUS% results to an %EVADE% result.%LINEBREAK%<strong>Adaptive Ailerons:</strong> Before you reveal your dial, if you are not stressed, you <b>must</b> execute a white [1&nbsp;%BANKLEFT%], [1&nbsp;%STRAIGHT%], or [1&nbsp;%BANKRIGHT%] maneuver."""
        "Captain Jonus":
           display_name: """Captain Jonus"""
           text: """While a friendly ship at range 0-1 performs a %TORPEDO% or %MISSILE% attack, that ship may reroll up to 2 attack dice. %LINEBREAK%<strong>Nimble Bomber:</strong> If you would drop a device using a %STRAIGHT% template, you may use a %BANKLEFT% or %BANKRIGHT% template of the same speed instead."""
        "Captain Jostero":
           display_name: """Captain Jostero"""
           text: """After an enemy ship suffers damage, if it is not defending, you may perform a bonus attack against that ship."""
        "Captain Kagi":
           display_name: """Captain Kagi"""
           text: """At the start of the Engagement Phase, you may choose 1 or more friendly ships at range 0-3. If you do, transfer all enemy lock tokens from the chosen ships to you."""
        "Captain Nym":
           display_name: """Captain Nym"""
           text: """Before a friendly bomb or mine would detonate, you may spend 1&nbsp;%CHARGE% to prevent it from detonating.%LINEBREAK% While you defend against an attack obstructed by a bomb or mine, roll 1 additional defense die."""
        "Captain Oicunn":
           display_name: """Captain Oicunn"""
           text: """You can perform primary attacks at range 0."""
        "Captain Rex":
           display_name: """Captain Rex"""
           text: """After you perform an attack, assign the <strong>Suppressive Fire</strong> condition to the defender."""
        "Captain Sear":
           display_name: """Captain Sear"""
           text: """While a friendly ship at range&nbsp;0-3 performs a primary attack, if the defender is in its %BULLSEYEARC%, before the Neutralize Results step, the friendly ship may spend 1 calculate token to cancel 1 %EVADE% result."""
        "Captain Seevor":
           display_name: """Captain Seevor"""
           text: """While you defend or perform an attack, before attack dice are rolled, if you are not in the enemy ship’s %BULLSEYEARC%, you may spend 1&nbsp;%CHARGE%. If you do, the enemy ship gains 1&nbsp;jam token.%LINEBREAK%<strong>Notched Stabilizers:</strong> While you move, you ignore asteroids."""
        "Cartel Executioner":
           display_name: """Cartel Executioner"""
           text: """<i class = flavor_text>Many veteran pilots in the service of the Hutt kajidics and other criminal operations choose the M12-L Kimogila for its firepower and dreaded reputation alike.</i>%LINEBREAK% <strong>Dead to Rights:</strong> While you perform an attack, if the defender is in your %BULLSEYEARC%, defense dice cannot be modified using green tokens."""
        "Cartel Marauder":
           display_name: """Cartel Marauder"""
           text: """<i class = flavor_text>The versatile Kihraxz was modeled after Incom’s popular X-wing starfighter, but an array of after-market modification kits ensure a wide variety of designs. </i>"""
        "Cartel Spacer":
           display_name: """Cartel Spacer"""
           text: """<i class = flavor_text>MandalMotors’ M3-A “Scyk” Interceptor is purchased in large quantities by the Hutt Cartel and the Car’das smugglers due to its low cost and customizability.</i> %LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1 %CANNON%, %TORPEDO%, or %MISSILE% upgrade."""
        "Cassian Andor":
           display_name: """Cassian Andor"""
           text: """At the start of the Activation Phase, you may choose 1 friendly ship at range 1-3. If you do, that ship removes 1 stress token."""
        "Cat":
           display_name: """Cat"""
           text: """While you perform a primary attack, if the defender is at range 0-1 of at least 1&nbsp;friendly device, roll 1 additional die."""
        "Cavern Angels Zealot":
           display_name: """Cavern Angels Zealot"""
           text: """<i class = flavor_text>Unlike most Rebel cells, Saw Gerrera’s partisans are willing to use extreme methods to undermine the Galactic Empire’s objectives in brutal battles that rage from Geonosis to Jedha.</i>"""
        "Chewbacca":
           display_name: """Chewbacca"""
           text: """Before you would be dealt a faceup damage card, you may spend 1&nbsp;%CHARGE% to be dealt the card facedown instead."""
        "Chewbacca (Resistance)":
           display_name: """Chewbacca"""
           text: """After a friendly ship at range 0-3 is destroyed, before that ship is removed, you may perform an action. Then you may perform a bonus attack.%LINEBREAK%<i><strong>Note:</strong>The phrase "before that ship is removed" is not printed on the card, but within the official squad builder.</i>"""
        "Cobalt Squadron Bomber":
           display_name: """Cobalt Squadron Bomber"""
           text: """<i class = flavor_text>Whether the ordnance silos of their StarFortresses are loaded with proton bombs or relief supplies, the heroic crews of Cobalt Squadron dedicate their lives to making a difference in the galaxy.</i>"""
        "Colonel Jendon":
           display_name: """Colonel Jendon"""
           text: """At the start of the Activation Phase, you may spend 1&nbsp;%CHARGE%. If you do, while friendly ships acquire locks this round, they must acquire locks beyond range 3 instead of at range 0-3."""
        "Colonel Vessery":
           display_name: """Colonel Vessery"""
           text: """While you perform an attack against a locked ship, after you roll attack dice, you may acquire a lock on the defender.%LINEBREAK%<strong>Full Throttle:</strong> After you fully execute a speed 3-5 maneuver, you may perform an %EVADE% action."""
        "Commander Malarus":
           display_name: """Commander Malarus"""
           text: """At the start of the Engagement Phase, you may spend 1&nbsp;%CHARGE% and gain 1 stress token. If you do, until the end of the round, while you defend or perform an attack, you may change all of your %FOCUS% results to %EVADE% or %HIT% results."""
        "Constable Zuvio":
           display_name: """Constable Zuvio"""
           text: """If you would drop a device, you may launch it using a [1&nbsp;%STRAIGHT%] template instead.%LINEBREAK%<strong>Spacetug Tractor Array:</strong> <strong>Action:</strong> Choose a ship in your %FRONTARC% at range 1. That ship gains 1 tractor token, or 2 tractor tokens if it is in your %BULLSEYEARC% at range 1."""
        "Contracted Scout":
           display_name: """Contracted Scout"""
           text: """<i class = flavor_text>Built for long-distance reconnaissance and plotting new hyperspace routes, the lightly armed JumpMaster 5000 is often extensively retrofitted with custom upgrades.</i>"""
        "Corran Horn":
           display_name: """Corran Horn"""
           text: """At initiative 0, you may perform a bonus primary attack against an enemy ship in your %BULLSEYEARC%. If you do, at the start of the next Planning Phase, gain 1 disarm token.%LINEBREAK%<strong>Experimental Scanners:</strong> You can acquire locks beyond range 3. You cannot acquire locks at range 1."""
        "Count Dooku":
           display_name: """Count Dooku"""
           text: """After you defend, if the attacker is in your firing arc, you may spend 1&nbsp;%FORCE% to remove 1 of your blue or red tokens.%LINEBREAK%After you perform an attack that hits, you may spend 1 %FORCE% to perform an action."""
        "Countess Ryad":
           display_name: """Countess Ryad"""
           text: """While you would execute a %STRAIGHT% maneuver, you may increase the difficulty of the maneuver. If you do, execute it as a %KTURN% maneuver instead.%LINEBREAK%<strong>Full Throttle:</strong> After you fully execute a speed 3-5 maneuver, you may perform an %EVADE% action."""
        "Crymorah Goon":
           display_name: """Crymorah Goon"""
           text: """<i class = flavor_text>Though far from nimble, the Y-wing’s heavy hull, substantial shielding, and turret-mounted cannons make it an excellent patrol craft.</i>"""
        "Cutlass Squadron Pilot":
           display_name: """Cutlass Squadron Pilot"""
           text: """<i class = flavor_text>The TIE punisher’s design builds upon the success of the TIE bomber, adding shielding, a second bomb chute, and three additional ordnance pods, each equipped with a twin ion engine.</i>"""
        "DBS-32C":
           display_name: """DBS-32C"""
           text: """At the start of the Engagement Phase, you may spend 1 calculate token to perform a %COORDINATE% action. You cannot coordinate ships that do not have the <strong>Networked Calculations</strong> ship ability. %LINEBREAK%<strong>Networked Calculations:</strong> While you defend or perform an attack, you may spend 1 calculate token from a friendly ship at range&nbsp;0-1 to change 1&nbsp;%FOCUS% result to an %EVADE% or %HIT% result."""
        "DBS-404":
           display_name: """DBS-404"""
           text: """You can perform primary attacks at range 0. While you perform an attack at attack range 0-1, you <strong>must</strong> roll 1 additional die. After the attack hits, suffer 1 %CRIT% damage. %LINEBREAK%<strong>Networked Calculations:</strong> While you defend or perform an attack, you may spend 1 calculate token from a friendly ship at range&nbsp;0-1 to change 1&nbsp;%FOCUS% result to an %EVADE% or %HIT% result."""
        "DFS-081":
           display_name: """DFS-081"""
           text: """While a friendly ship at range 0-1 defends, it may spend 1 calculate token to change all %CRIT% results to %HIT% results.%LINEBREAK%<strong>Networked Calculations:</strong> While you defend or perform an attack, you may spend 1 calculate token from a friendly ship at range&nbsp;0-1 to change 1&nbsp;%FOCUS% result to an %EVADE% or %HIT% result."""
        "DFS-311":
           display_name: """DFS-311"""
           text: """At the start of the Engagement Phase, you may transfer 1 of your calculate tokens to another friendly ship at range&nbsp;0-3.%LINEBREAK%<strong>Networked Calculations:</strong> While you defend or perform an attack, you may spend 1 calculate token from a friendly ship at range&nbsp;0-1 to change 1&nbsp;%FOCUS% result to an %EVADE% or %HIT% result."""
        "Dace Bonearm":
           display_name: """Dace Bonearm"""
           text: """After an enemy ship at range 0-3 receives at least 1 ion token, you may spend 3&nbsp;%CHARGE%. If you do, that ship gains 2 additional ion tokens."""
        "Dalan Oberos (StarViper)":
           display_name: """Dalan Oberos"""
           text: """After you fully execute a maneuver, you may gain 1 stress token to rotate your ship 90º.%LINEBREAK% <strong>Microthrusters:</strong> While you perform a barrel roll, you <b>must</b> use the %BANKLEFT% or %BANKRIGHT% template instead of the %STRAIGHT% template."""
        "Dalan Oberos":
           display_name: """Dalan Oberos"""
           text: """At the start of the Engagement Phase, you may choose 1 shielded ship in your %BULLSEYEARC% and spend 1&nbsp;%CHARGE%. If you do, that ship loses 1 shield and you recover 1 shield.%LINEBREAK%<strong>Dead to Rights:</strong> While you perform an attack, if the defender is in your %BULLSEYEARC%, defense dice cannot be modified using green tokens."""
        "Dark Courier":
           display_name: """Dark Courier"""
           text: """<i class = flavor_text>The vessel called the Scimitar was heavily modified, equipped with stealth technologies and advanced surveillance devices for infiltration and assassination missions.</i>"""
        "Darth Maul":
           display_name: """Darth Maul"""
           text: """After you perform an attack, you may spend 2 %FORCE% to perform a bonus primary attack against a different target. If your attack missed, you may perform that bonus primary attack against the same target instead."""
        "Darth Vader":
           display_name: """Darth Vader"""
           text: """After you perform an action, you may spend 1&nbsp;%FORCE% to perform an action.%LINEBREAK%<strong>Advanced Targeting Computer:</strong> While you perform a primary attack against a defender you have locked, roll 1 additional attack die and change 1&nbsp;%HIT% result to a %CRIT% result."""
        "Dash Rendar":
           display_name: """Dash Rendar"""
           text: """While you move, you ignore obstacles.%LINEBREAK%<strong>Sensor Blindspot:</strong> While you perform a primary attack at attack range 0-1, do not apply the range 0-1 bonus and roll 1 fewer attack die."""
        "Del Meeko":
           display_name: """Del Meeko"""
           text: """While a friendly ship at range 0-2 defends against a damaged attacker, the defender may reroll 1 defense die."""
        "Delta Squadron Pilot":
           display_name: """Delta Squadron Pilot"""
           text: """<i class = flavor_text>In addition to its missile launchers and six wingtip laser cannons, the formidable TIE defender is equipped with deflector shields and a hyperdrive.</i>%LINEBREAK%<strong>Full Throttle:</strong> After you fully execute a speed 3-5 maneuver, you may perform an %EVADE% action."""
        "Dengar":
           display_name: """Dengar"""
           text: """After you defend, if the attacker is in your %FRONTARC%, you may spend 1&nbsp;%CHARGE% to perform a bonus attack against the attacker."""
        "Drea Renthal":
           display_name: """Drea Renthal"""
           text: """While a friendly non-limited ship performs an attack, if the defender is in your firing arc, the attacker may reroll 1 attack die."""
        "Edon Kappehl":
           display_name: """Edon Kappehl"""
           text: """After you fully execute a blue or white maneuver, if you have not dropped or launched a device this round, you may drop 1 device."""
        "Edrio Two Tubes":
           display_name: """Edrio Two Tubes"""
           text: """Before you activate, if you are focused, you may perform an action."""
        "Ello Asty":
           display_name: """Ello Asty"""
           text: """After you reveal a red Tallon Roll [%TROLLLEFT% or %TROLLRIGHT%] maneuver, if you have 2 or fewer stress tokens, treat that maneuver as white.%LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1&nbsp;%CANNON%, %TORPEDO%, or %MISSILE% upgrade."""
        "Emon Azzameen":
           display_name: """Emon Azzameen"""
           text: """If you would drop a device using a [1&nbsp;%STRAIGHT%] template, you may use the [3&nbsp;%TURNLEFT%], [3&nbsp;%STRAIGHT%], or [3&nbsp;%TURNRIGHT%] template instead."""
        "Epsilon Squadron Cadet":
           display_name: """Epsilon Squadron Cadet"""
           text: """<i class = flavor_text>Trained from childhood aboard Resurgent-class Star Destroyers in deep space, many First Order TIE pilots have never even set foot on a planet’s surface.</i>"""
        "Esege Tuketu":
           display_name: """Esege Tuketu"""
           text: """While a friendly ship at range 0-2 defends or performs an attack, it may spend your focus tokens as if that ship has them."""
        "Evaan Verlaine":
           display_name: """Evaan Verlaine"""
           text: """At the start of the Engagement Phase, you may spend 1 focus token to choose a friendly ship at range 0-1. If you do, that ship rolls 1 additional defense die while defending until the end of the round."""
        "Ezra Bridger":
           display_name: """Ezra Bridger"""
           text: """While you defend or perform an attack, if you are stressed, you may spend 1&nbsp;%FORCE% to change up to 2 of your %FOCUS% results to %EVADE% or %HIT% results.%LINEBREAK%<strong>Locked and Loaded:</strong> While you are docked, after your carrier ship performs a primary %FRONTARC% or %TURRET% attack, it may perform a bonus primary %REARARC% attack."""
        "Ezra Bridger (Sheathipede)":
           display_name: """Ezra Bridger"""
           text: """While you defend or perform an attack, if you are stressed, you may spend 1&nbsp;%FORCE% to change up to 2 of your %FOCUS% results to %EVADE% /%HIT% results. %LINEBREAK%<strong>Comms Shuttle:</strong> While you are docked, your carrier ship gains %COORDINATE%. Before your carrier ship activates, it may perform a %COORDINATE% action."""
        "Ezra Bridger (TIE Fighter)":
           display_name: """Ezra Bridger"""
           text: """While you defend or perform an attack, if you are stressed, you may spend 1&nbsp;%FORCE% to change up to 2 of your %FOCUS% results to %EVADE% or %HIT% results."""
        "Feethan Ottraw Autopilot":
           display_name: """Feethan Ottraw Autopilot"""
           text: """<i class = flavor_text>Unlike the more disposable fighters it also built for the Separatists, Feethan Ottraw Scalable Assemblies designed the Belbullab-22 with a solid mix of firepower, durability, and speed.</i>"""
        "Fenn Rau (Sheathipede)":
           display_name: """Fenn Rau"""
           text: """Before an enemy ship in your firing arc engages, if you are not stressed, you may gain 1 stress token. If you do, that ship cannot spend tokens to modify dice while it performs an attack during this phase.%LINEBREAK%<strong>Comms Shuttle:</strong> While you are docked, your carrier ship gains %COORDINATE%. Before your carrier ship activates, it may perform a %COORDINATE% action. %LINEBREAK% <i>Errata (since rules reference 1.1.0): Replaced "After an enemy ship in your firing arc engages")</i>"""
        "Fenn Rau":
           display_name: """Fenn Rau"""
           text: """While you defend or perform an attack, if the attack range is 1, you may roll 1 additional die.%LINEBREAK%<strong>Concordia Faceoff:</strong> While you defend, if the attack range is 1 and you are in the attacker’s %FRONTARC%, change 1 result to an %EVADE% result."""
        "Finch Dallow":
           display_name: """Finch Dallow"""
           text: """Before you would drop a bomb, you may place it in the play area touching you instead."""
        "First Order Test Pilot":
           display_name: """First Order Test Pilot"""
           text: """<i class = flavor_text>Engineered for incredible speed and precise handling, the TIE Silencer is devastating in the hands of those who can unlock its full potential. Any lesser pilot could easily be overwhelmed and lose control of the nimble craft. </i>%LINEBREAK%<strong>Autothrusters:</strong> After you perform an action, you may perform a red %BARRELROLL% or red %BOOST% action."""
        "Foreman Proach":
           display_name: """Foreman Proach"""
           text: """Before you engage, you may choose 1&nbsp;enemy ship in your %BULLSEYEARC% at range 1-2 and gain 1 disarm token. If you do, that ship gains 1 tractor token.%LINEBREAK%<strong>Notched Stabilizers:</strong> While you move, you ignore asteroids."""
        "Freighter Captain":
           display_name: """Freighter Captain"""
           text: """<i class = flavor_text>Many spacers make a living traveling the Outer Rim, where the difference between smuggler and legitimate merchant is often murky. On the outskirts of civilization, buyers are rarely so discerning to ask where merchandise came from, at least as long as the price is low enough.</i>"""
        "Gamma Squadron Ace":
           display_name: """Gamma Squadron Ace"""
           text: """<i class = flavor_text>Though it sacrifices a degree of speed and maneuverability compared to a TIE/ln, the TIE bomber’s increased payload can carry enough firepower to destroy virtually any enemy target.</i> %LINEBREAK%<strong>Nimble Bomber:</strong> If you would drop a device using a %STRAIGHT% template, you may use a %BANKLEFT% or %BANKRIGHT% template of the same speed instead."""
        "Gand Findsman":
           display_name: """Gand Findsman"""
           text: """<i class = flavor_text>The legendary Findsmen of Gand worship the enshrouding mists of their home planet, using signs, augurs, and mystical rituals to track their quarry.</i>"""
        "Garven Dreis (X-Wing)":
           display_name: """Garven Dreis"""
           text: """After you spend a focus token, you may choose 1 friendly ship at range 1-3. That ship gains 1 focus token."""
        "Garven Dreis":
           display_name: """Garven Dreis"""
           text: """After you spend a focus token, you may choose 1 friendly ship at range 1-3. That ship gains 1 focus token."""
        "Gavin Darklighter":
           display_name: """Gavin Darklighter"""
           text: """While a friendly ship performs an attack, if the defender is in your %FRONTARC%, the attacker may change 1&nbsp;%HIT% result to a %CRIT% result.%LINEBREAK%<strong>Experimental Scanners:</strong> You can acquire locks beyond range 3. You cannot acquire locks at range 1."""
        "General Grievous":
           display_name: """General Grievous"""
           text: """While you perform a primary attack, if you are not in the defender’s firing arc, you may reroll up to 2&nbsp;attack dice."""
        "Genesis Red":
           display_name: """Genesis Red"""
           text: """After you acquire a lock, you must remove all of your focus and evade tokens. Then, gain the same number of focus and evade tokens that the locked ship has.%LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1 %CANNON%, %TORPEDO%, or %MISSILE% upgrade."""
        "Gideon Hask":
           display_name: """Gideon Hask"""
           text: """While you perform an attack against a damaged defender, roll 1 additional attack die."""
        "Gold Squadron Trooper":
           display_name: """Gold Squadron Trooper"""
           text: """<i class = flavor_text>The V-19 Torrent starfighter was designed to be a light escort to nimble Delta-7 interceptors flown by Jedi Knights, and has a unique flight profile to reflect this role.</i>"""
        "Gold Squadron Veteran":
           display_name: """Gold Squadron Veteran"""
           text: """<i class = flavor_text>Commanded by Jon “Dutch” Vander, Gold Squadron played an instrumental role in the Battles of Scarif and Yavin.</i>"""
        "Grand Inquisitor":
           display_name: """Grand Inquisitor"""
           text: """While you defend at attack range 1, you may spend 1&nbsp;%FORCE% to prevent the range 1 bonus. %LINEBREAK%While you perform an attack against a defender at attack range 2-3, you may spend 1&nbsp;%FORCE% to apply the range 1 bonus."""
        "Gray Squadron Bomber":
           display_name: """Gray Squadron Bomber"""
           text: """<i class = flavor_text>Long after the Y-wing was phased out by the Galactic Empire, its durability, dependability, and heavy armament help it remain a staple in the Rebel fleet.</i>"""
        "Graz":
           display_name: """Graz"""
           text: """While you defend, if you are behind the attacker, roll 1 additional defense die.%LINEBREAK%While you perform an attack, if you are behind the defender, roll 1 additional attack die."""
        "Green Squadron Expert":
           display_name: """Green Squadron Expert"""
           text: """<i class = flavor_text>Years of field-expedient modifications were standardized in the RZ-2 design, but daring pilots see the ship’s improved reliability as a challenge to further push the limits of its performance.</i>%LINEBREAK%<strong>Refined Gyrostabilizers:</strong> You can rotate your %SINGLETURRETARC% indicator only to your %FRONTARC% or %REARARC%. After you perform an action, you may perform a red %BOOST% or red %ROTATEARC% action."""
        "Green Squadron Pilot":
           display_name: """Green Squadron Pilot"""
           text: """<i class = flavor_text>Due to its sensitive controls and high maneuverability, only the most talented pilots belong in an A-wing cockpit.</i>%LINEBREAK%<strong>Vectored Thrusters:</strong> After you perform an action, you may perform a red %BOOST% action."""
        "Greer Sonnel":
           display_name: """Greer Sonnel"""
           text: """After you fully execute a maneuver, you may rotate your %SINGLETURRETARC%.%LINEBREAK%<strong>Refined Gyrostabilizers:</strong> You can rotate your %SINGLETURRETARC% indicator only to your %FRONTARC% or %REARARC%. After you perform an action, you may perform a red %BOOST% or red %ROTATEARC% action."""
        "Guri":
           display_name: """Guri"""
           text: """At the start of the Engagement Phase, if there is at least 1 enemy ship at range 0-1, you may gain 1 focus token.%LINEBREAK% <strong>Microthrusters:</strong> While you perform a barrel roll, you <b>must</b> use the %BANKLEFT% or %BANKRIGHT% template instead of the %STRAIGHT% template."""
        "Han Solo":
           display_name: """Han Solo"""
           text: """After you roll dice, if you are at range 0-1 of an obstacle, you may reroll all of your dice. This does not count as rerolling for the purpose of other effects."""
        "Han Solo (Scum)":
           display_name: """Han Solo"""
           text: """While you defend or perform a primary attack, if the attack is obstructed by an obstacle, you may roll 1 additional die."""
        "Han Solo (Resistance)":
           display_name: """Han Solo"""
           text: """<strong>Setup:</strong> You can be placed anywhere in the play area beyond range 3 of enemy ships."""
        "Heff Tobber":
           display_name: """Heff Tobber"""
           text: """After an enemy ship executes a maneuver, if it is at range 0, you may perform an action."""
        "Hera Syndulla":
           display_name: """Hera Syndulla"""
           text: """After you reveal a red or blue maneuver, you may set your dial to another maneuver of the same difficulty.%LINEBREAK%<strong>Locked and Loaded:</strong> While you are docked, after your carrier ship performs a primary %FRONTARC% or %TURRET% attack, it may perform a bonus primary %REARARC% attack."""
        "Hera Syndulla (VCX-100)":
           display_name: """Hera Syndulla"""
           text: """After you reveal a red or blue maneuver, you may set your dial to another maneuver of the same difficulty.%LINEBREAK%<strong>Tail Gun:</strong> While you have a docked ship, you have a primary %REARARC% weapon with an attack value equal to your docked ship’s primary %FRONTARC% attack value."""
        "Hired Gun":
           display_name: """Hired Gun"""
           text: """<i class = flavor_text>Just the mention of Imperial credits can bring a host of less-than-trustworthy individuals to your side.</i>"""
        "Horton Salm":
           display_name: """Horton Salm"""
           text: """While you perform an attack, you may reroll 1 attack die for each other friendly ship at range 0-1 of the defender."""
        "IG-88A":
           display_name: """IG-88A"""
           text: """At the start of the Engagement Phase, you may choose 1 friendly ship with %CALCULATE% on its action bar at range 1-3. If you do, transfer 1 of your calculate tokens to it. %LINEBREAK%<strong>Advanced Droid Brain:</strong> After you perform a %CALCULATE% action, gain 1 calculate token."""
        "IG-88B":
           display_name: """IG-88B"""
           text: """After you perform an attack that misses, you may perform a bonus %CANNON% attack.%LINEBREAK%<strong>Advanced Droid Brain:</strong> After you perform a %CALCULATE% action, gain 1 calculate token."""
        "IG-88C":
           display_name: """IG-88C"""
           text: """After you perform a %BOOST% action, you may perform an %EVADE% action.%LINEBREAK%<strong>Advanced Droid Brain:</strong> After you perform a %CALCULATE% action, gain 1 calculate token."""
        "IG-88D":
           display_name: """IG-88D"""
           text: """While you execute a Segnor’s Loop (%SLOOPLEFT% or %SLOOPRIGHT%) maneuver, you may use another template of the same speed instead: either the turn (%TURNLEFT% or %TURNRIGHT%) of the same direction or the straight (%STRAIGHT%) template.%LINEBREAK%<strong>Advanced Droid Brain:</strong> After you perform a %CALCULATE% action, gain 1 calculate token."""
        "Ibtisam":
           display_name: """Ibtisam"""
           text: """After you fully execute a maneuver, if you are stressed, you may roll 1 attack die. On a %HIT% or %CRIT% result, remove 1 stress token."""
        "Iden Versio":
           display_name: """Iden Versio"""
           text: """Before a friendly TIE/ln fighter at range 0-1 would suffer 1 or more damage, you may spend 1&nbsp;%CHARGE%. If you do, prevent that damage."""
        "Imdaar Test Pilot":
           display_name: """Imdaar Test Pilot"""
           text: """<i class = flavor_text>The primary result of a hidden research facility on Imdaar Alpha, the TIE phantom achieves what many thought was impossible: a small starfighter equipped with an advanced cloaking device.</i>%LINEBREAK%<strong>Stygium Array:</strong> After you decloak, you may perform an %EVADE% action. At the start of the End Phase, you may spend 1 evade token to gain 1 cloak token."""
        "Inaldra":
           display_name: """Inaldra"""
           text: """While you defend or perform an attack, you may suffer 1&nbsp;%HIT% damage to reroll any number of your dice.%LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1 %CANNON%, %TORPEDO%, or %MISSILE% upgrade. """
        "Inquisitor":
           display_name: """Inquisitor"""
           text: """<i class = flavor_text>The fearsome Inquisitors are given a great deal of autonomy and access to the Empire’s latest technology, like the prototype TIE Advanced v1.</i>"""
        "Jake Farrell":
           display_name: """Jake Farrell"""
           text: """After you perform a %BARRELROLL% or %BOOST% action, you may choose a friendly ship at range 0-1. That ship may perform a %FOCUS% action.%LINEBREAK%<strong>Vectored Thrusters:</strong> After you perform an action, you may perform a red %BOOST% action."""
        "Jakku Gunrunner":
           display_name: """Jakku Gunrunner"""
           text: """<i class = flavor_text>The Quadrijet transfer spacetug, commonly called a "Quadjumper," is nimble in space and atmosphere alike, making it popular among both smugglers and explorers.</i> %LINEBREAK%<strong>Spacetug Tractor Array:</strong> <strong>Action:</strong> Choose a ship in your %FRONTARC% at range 1. That ship gains 1 tractor token, or 2 tractor tokens if it is in your %BULLSEYEARC% at range 1."""
        "Jan Ors":
           display_name: """Jan Ors"""
           text: """While a friendly ship in your firing arc performs a primary attack, if you are not stressed, you may gain 1 stress token. If you do, that ship may roll 1 additional attack die."""
        "Jaycris Tubbs":
           display_name: """Jaycris Tubbs"""
           text: """After you fully execute a blue maneuver, you may choose a friendly ship at range&nbsp;0-1. If you do, that ship removes 1&nbsp;stress token.%LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1&nbsp;%CANNON%, %TORPEDO%, or %MISSILE% upgrade."""
        "Jedi Knight":
           display_name: """Jedi Knight"""
           text: """<i class = flavor_text>When the Clone Wars began, the Jedi Knights rallied to the cause of preserving the Republic, assuming command of legions of clone troopers and leading them in battle.</i>%LINEBREAK%<strong>Fine-tuned Controls:</strong> After you fully execute a maneuver, you may spend 1&nbsp;%FORCE% to perform a %BOOST% or %BARRELROLL% action."""
        "Jek Porkins":
           display_name: """Jek Porkins"""
           text: """After you receive a stress token, you may roll 1 attack die to remove it. On a %HIT% result, suffer 1&nbsp;%HIT% damage."""
        "Jessika Pava":
           display_name: """Jessika Pava"""
           text: """While you defend or perform an attack, you may spend 1&nbsp;%CHARGE% or 1 non-recurring&nbsp;%CHARGE% from your equipped %ASTROMECH% upgrade to reroll up to 1&nbsp;of your dice for each other friendly ship at range 0-1.%LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1&nbsp;%CANNON%, %TORPEDO%, or %MISSILE% upgrade."""
        "Joph Seastriker":
           display_name: """Joph Seastriker"""
           text: """After you lose 1 shield, gain 1&nbsp;evade token.%LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1&nbsp;%CANNON%, %TORPEDO%, or %MISSILE% upgrade."""
        "Joy Rekkoff":
           display_name: """Joy Rekkoff"""
           text: """While you perform an attack, you may spend 1&nbsp;%CHARGE% from an equipped %TORPEDO% upgrade. If you do, the defender rolls 1 fewer defense die.%LINEBREAK%<strong>Concordia Faceoff:</strong> While you defend, if the attack range is 1 and you are in the attacker’s %FRONTARC%, change 1 result to an %EVADE% result."""
        "Kaa'to Leeachos":
           display_name: """Kaa’to Leeachos"""
           text: """At the start of the Engagement Phase, you may choose 1 friendly ship at range 0-2. If you do, transfer 1 focus or evade token from that ship to yourself. """
        "Kad Solus":
           display_name: """Kad Solus"""
           text: """After you fully execute a red maneuver, gain 2 focus tokens.%LINEBREAK%<strong>Concordia Faceoff:</strong> While you defend, if the attack range is 1 and you are in the attacker’s %FRONTARC%, change 1 result to an %EVADE% result."""
        "Kanan Jarrus":
           display_name: """Kanan Jarrus"""
           text: """While a friendly ship in your firing arc defends, you may spend 1&nbsp;%FORCE%. If you do, the attacker rolls 1 fewer attack die.%LINEBREAK%<strong>Tail Gun:</strong> While you have a docked ship, you have a primary %REARARC% weapon with an attack value equal to your docked ship’s primary %FRONTARC% attack value."""
        "Kare Kun":
           display_name: """Kare Kun"""
           text: """While you boost, you may use the [1 %TURNLEFT%] or [1 %TURNRIGHT%] template instead.%LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1&nbsp;%CANNON%, %TORPEDO%, or %MISSILE% upgrade."""
        "Kashyyyk Defender":
           display_name: """Kashyyyk Defender"""
           text: """<i class = flavor_text>Equipped with three wide-range Sureggi twin laser cannons, the Auzituck gunship acts as a powerful deterrent to slaver operations in the Kashyyyk system.</i>"""
        "Kath Scarlet":
           display_name: """Kath Scarlet"""
           text: """While you perform a primary attack, if there is at least 1 friendly non-limited ship at range 0 of the defender, roll 1 additional attack die."""
        "Kavil":
           display_name: """Kavil"""
           text: """While you perform a non-%FRONTARC% attack, roll 1 additional attack die."""
        "Ketsu Onyo":
           display_name: """Ketsu Onyo"""
           text: """At the start of the Engagement Phase, you may choose 1 ship in both your %FRONTARC% and %SINGLETURRETARC% at range 0-1. If you do, it gains 1 tractor token."""
        "Knave Squadron Escort":
           display_name: """Knave Squadron Escort"""
           text: """<i class = flavor_text>Designed to combine the best features of the X-wing series with the A-wing series, the E-wing boasts superior firepower, speed, and maneuverability.</i>%LINEBREAK% <strong>Experimental Scanners:</strong> You can acquire locks beyond range 3. You cannot acquire locks at range 1."""
        "Koshka Frost":
           display_name: """Koshka Frost"""
           text: """While you defend or perform an attack, if the enemy ship is stressed, you may reroll 1 of your dice."""
        "Krassis Trelix":
           display_name: """Krassis Trelix"""
           text: """You can perform %FRONTARC% special attacks from your %REARARC%.%LINEBREAK%While you perform a special attack, you may reroll 1 attack die."""
        "Kullbee Sperado":
           display_name: """Kullbee Sperado"""
           text: """After you perform a %BARRELROLL% or %BOOST% action, you may flip your equipped %CONFIG% upgrade card."""
        "Kyle Katarn":
           display_name: """Kyle Katarn"""
           text: """At the start of the Engagement Phase, you may transfer 1 of your focus tokens to a friendly ship in your firing arc."""
        "Kylo Ren":
           display_name: """Kylo Ren"""
           text: """After you defend, you may spend 1&nbsp;%FORCE% to assign the <strong>I’ll Show You the Dark Side</strong> condition to the attacker.%LINEBREAK%<strong>Autothrusters:</strong> After you perform an action, you may perform a red %BARRELROLL% or red %BOOST% action."""
        "L3-37":
           display_name: """L3-37"""
           text: """If you are not shielded, decrease the difficulty of your bank (%BANKLEFT% and %BANKRIGHT%) maneuvers."""
        "L3-37 (Escape Craft)":
           display_name: """L3-37"""
           text: """If you are not shielded, decrease the difficulty of your bank (%BANKLEFT% and %BANKRIGHT%) maneuvers.%LINEBREAK%<strong>Co-Pilot:</strong> While you are docked, your carrier ship has your pilot ability in addition to its own."""
        "Laetin A'shera":
           display_name: """Laetin A’shera"""
           text: """After you defend or perform an attack, if the attack missed, gain 1 evade token.%LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1 %CANNON%, %TORPEDO%, or %MISSILE% upgrade."""
        "Lando Calrissian":
           display_name: """Lando Calrissian"""
           text: """After you fully execute a blue maneuver, you may choose a friendly ship at range 0-3. That ship may perform an action."""
        "Lando Calrissian (Scum)":
           display_name: """Lando Calrissian"""
           text: """After you roll dice, if you are not stressed, you may gain 1 stress token to reroll all of your blank results."""
        "Lando Calrissian (Scum) (Escape Craft)":
           display_name: """Lando Calrissian"""
           text: """After you roll dice, if you are not stressed, you may gain 1 stress token to reroll all of your blank results.%LINEBREAK%<strong>Co-Pilot:</strong> While you are docked, your carrier ship has your pilot ability in addition to its own."""
        "Latts Razzi":
           display_name: """Latts Razzi"""
           text: """At the start of the Engagement Phase, you may choose a ship at range 1 and spend a lock you have on that ship. If you do, that ship gains 1 tractor token."""
        "Leevan Tenza":
           display_name: """Leevan Tenza"""
           text: """After you perform a %BARRELROLL% or %BOOST% action, you may perform a red %EVADE% action."""
        "Lieutenant Bastian":
           display_name: """Lieutenant Bastian"""
           text: """After a ship at range 1-2 is dealt a damage card, you may acquire a lock on that ship.%LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1&nbsp;%CANNON%, %TORPEDO%, or %MISSILE% upgrade."""
        "Lieutenant Blount":
           display_name: """Lieutenant Blount"""
           text: """While you perform a primary attack, if there is at least 1 other friendly ship at range 0-1 of the defender, you may roll 1 additional attack die."""
        "Lieutenant Dormitz":
           display_name: """Lieutenant Dormitz"""
           text: """<strong>Setup</strong>: After you are placed, other friendly ships can be placed anywhere in the play area at range 0-2 of you.%LINEBREAK%<strong>Linked Battery:</strong> While you perform a %CANNON% attack, roll 1 additional die."""
        "Lieutenant Karsabi":
           display_name: """Lieutenant Karsabi"""
           text: """After you gain a disarm token, if you are not stressed, you may gain 1 stress token to remove 1 disarm token."""
        "Lieutenant Kestal":
           display_name: """Lieutenant Kestal"""
           text: """While you perform an attack, after the defender rolls defense dice, you may spend 1 focus token to cancel all of the defender’s blank/%FOCUS% results."""
        "Lieutenant Rivas":
           display_name: """Lieutenant Rivas"""
           text: """After a ship at range 1-2 gains a red or orange token, if you do not have that ship locked, you may acquire a lock on that ship."""
        "Lieutenant Sai":
           display_name: """Lieutenant Sai"""
           text: """After you a perform a %COORDINATE% action, if the ship you chose performed an action on your action bar, you may perform that action."""
        "Lieutenant Tavson":
           display_name: """Lieutenant Tavson"""
           text: """After you suffer damage, you may spend 1&nbsp;%CHARGE% to perform an action.%LINEBREAK%<strong>Linked Battery:</strong> While you perform a %CANNON% attack, roll 1 additional die."""
        "Lok Revenant":
           display_name: """Lok Revenant"""
           text: """<i class = flavor_text>The Nubian Design Collective crafted the Scurrg H-6 Bomber with combat versatility in mind, arming it with powerful shields and a bristling array of destructive weaponry.</i>"""
        "Lothal Rebel":
           display_name: """Lothal Rebel"""
           text: """<i class = flavor_text>Another successful Corellian Engineering Corporation freighter design, the VCX-100 is larger than the ubiquitous YT-series, boasting more living space and customizability.</i>%LINEBREAK%<strong>Tail Gun:</strong> While you have a docked ship, you have a primary %REARARC% weapon with an attack value equal to your docked ship’s primary %FRONTARC% attack value."""
        "Lowhhrick":
           display_name: """Lowhhrick"""
           text: """After a friendly ship at range 0-1 becomes the defender, you may spend 1 reinforce token. If you do, that ship gains 1 evade token."""
        "Luke Skywalker":
           display_name: """Luke Skywalker"""
           text: """After you become the defender (before dice are rolled), you may recover 1&nbsp;%FORCE%."""
        "Luminara Unduli":
           display_name: """Luminara Unduli"""
           text: """While a friendly ship at range&nbsp;0-2 defends, if it is not in the attacker’s %BULLSEYEARC%, you may spend 1&nbsp;%FORCE%. If you do, change 1&nbsp;%CRIT% result to a %HIT% result or 1 %HIT% result to a %FOCUS% result.%LINEBREAK%<strong>Fine-tuned Controls:</strong> After you fully execute a maneuver, you may spend 1&nbsp;%FORCE% to perform a %BOOST% or %BARRELROLL% action."""
        "L'ulo L'ampar":
           display_name: """L’ulo L’ampar"""
           text: """While you defend or perform a primary attack, if you are stressed, you <b>must</b> roll 1 fewer defense die or 1 additional attack die.%LINEBREAK%<strong>Refined Gyrostabilizers:</strong> You can rotate your %SINGLETURRETARC% indicator only to your %FRONTARC% or %REARARC%. After you perform an action, you may perform a red %BOOST% or red %ROTATEARC% action."""
        "Maarek Stele":
           display_name: """Maarek Stele"""
           text: """While you perform an attack, if the defender would be dealt a faceup damage card, instead draw 3 damage cards, choose 1, and discard the rest.%LINEBREAK%<strong>Advanced Targeting Computer:</strong> While you perform a primary attack against a defender you have locked, roll 1 additional attack die and change 1&nbsp;%HIT% result to a %CRIT% result. """
        "Mace Windu":
           display_name: """Mace Windu"""
           text: """After you fully execute a red maneuver, recover 1&nbsp;%FORCE%.%LINEBREAK%<strong>Fine-tuned Controls:</strong> After you fully execute a maneuver, you may spend 1&nbsp;%FORCE% to perform a %BOOST% or %BARRELROLL% action."""
        "Magva Yarro":
           display_name: """Magva Yarro"""
           text: """While a friendly ship at range 0-2 defends, the attacker cannot reroll more than 1 attack die."""
        "Major Rhymer":
           display_name: """Major Rhymer"""
           text: """While you perform a %TORPEDO% or %MISSILE% attack, you may increase or decrease the range requirement by 1, to a limit of 0-3. %LINEBREAK%<strong>Nimble Bomber:</strong> If you would drop a device using a %STRAIGHT% template, you may use a %BANKLEFT% or %BANKRIGHT% template of the same speed instead."""
        "Major Stridan":
           display_name: """Major Stridan"""
           text: """While you coordinate or resolve the effect of one of your upgrades, you may treat friendly ships at range 2-3 as being at range 0 or range 1.%LINEBREAK%<strong>Linked Battery:</strong> While you perform a %CANNON% attack, roll 1 additional die."""
        "Major Vermeil":
           display_name: """Major Vermeil"""
           text: """While you perform an attack, if the defender does not have any green tokens, you may change 1 of your blank or %FOCUS% results to a %HIT% result.%LINEBREAK% %LINEBREAK%<strong>Adaptive Ailerons:</strong> Before you reveal your dial, if you are not stressed, you <b>must</b> execute a white [1&nbsp;%BANKLEFT%], [1&nbsp;%STRAIGHT%], or [1&nbsp;%BANKRIGHT%] maneuver."""
        "Major Vynder":
           display_name: """Major Vynder"""
           text: """While you defend, if you are disarmed, roll 1 additional defense die."""
        "Manaroo":
           display_name: """Manaroo"""
           text: """At the start of the Engagement Phase, you may choose a friendly ship at range 0-1. If you do, transfer all green tokens assigned to you to that ship."""
        "Mining Guild Sentry":
           display_name: """Mining Guild Sentry"""
           text: """<i class = flavor_text>As part of its arrangement with the Empire, the Mining Guild receives modified TIE/ln Fighters to protect its operations. These craft have solar panels removed from their stabilizers for improved visibility, and feature more extensive life support systems for the benefit of their corporate pilots.</i>%LINEBREAK%<strong>Notched Stabilizers:</strong> While you move, you ignore asteroids."""
        "Mining Guild Surveyor":
           display_name: """Mining Guild Surveyor"""
           text: """<i class = flavor_text>With Imperial construction projects consuming raw materials at an unprecedented rate, the Mining Guild ruthlessly exploits newly discovered deposits of doonium ore on worlds such as Batonn, Lothal, and Umbara.</i>%LINEBREAK%<strong>Notched Stabilizers:</strong> While you move, you ignore asteroids."""
        "Miranda Doni":
           display_name: """Miranda Doni"""
           text: """While you perform a primary attack, you may either spend 1 shield to roll 1 additional attack die or, if you are not shielded, you may roll 1 fewer attack die to recover 1 shield."""
        "Moralo Eval":
           display_name: """Moralo Eval"""
           text: """If you would flee, you may spend 1&nbsp;%CHARGE%. If you do, place yourself in reserves instead. At the start of the next Planning Phase, place yourself within range 1 of the edge of the play area that you fled from."""
        "Nien Nunb":
           display_name: """Nien Nunb"""
           text: """After you gain a stress token, if there is an enemy ship in your %FRONTARC% at range 0-1, you may remove that stress token.%LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1&nbsp;%CANNON%, %TORPEDO%, or %MISSILE% upgrade."""
        "Norra Wexley (Y-Wing)":
           display_name: """Norra Wexley"""
           text: """While you defend, if there is an enemy ship at range 0-1, add 1&nbsp;%EVADE% result to your dice results."""
        "Norra Wexley":
           display_name: """Norra Wexley"""
           text: """While you defend, if there is an enemy ship at range 0-1, you may add 1&nbsp;%EVADE% result to your dice results."""
        "Nu Squadron Pilot":
           display_name: """Nu Squadron Pilot"""
           text: """<i class = flavor_text>With a design inspired by other Cygnus Spaceworks vessels, the Alpha-class star wing is a versatile craft assigned to Imperial Navy specialist units that need a starfighter they can outfit for multiple roles.</i>"""
        "N'dru Suhlak":
           display_name: """N’dru Suhlak"""
           text: """While you perform a primary attack, if there are no other friendly ships at range 0-2, roll 1 additional attack die."""
        "Obi-Wan Kenobi":
           display_name: """Obi-Wan Kenobi"""
           text: """After a friendly ship at range&nbsp;0-2 spends a focus token, you may spend 1&nbsp;%FORCE%. If you do, that ship gains 1&nbsp;focus token.%LINEBREAK%<strong>Fine-tuned Controls:</strong> After you fully execute a maneuver, you may spend 1&nbsp;%FORCE% to perform a %BOOST% or %BARRELROLL% action."""
        "Obsidian Squadron Pilot":
           display_name: """Obsidian Squadron Pilot"""
           text: """<i class = flavor_text>The TIE fighter’s Twin Ion Engine system was designed for speed, making the TIE/ln one of the most maneuverable starships ever mass-produced.</i>"""
        "Old Teroch":
           display_name: """Old Teroch"""
           text: """At the start of the Engagement Phase, you may choose 1 enemy ship at range 1. If you do and you are in its %FRONTARC%, it removes all of its green tokens.%LINEBREAK%<strong>Concordia Faceoff:</strong> While you defend, if the attack range is 1 and you are in the attacker’s %FRONTARC%, change 1 result to an %EVADE% result."""
        "Omega Squadron Ace":
           display_name: """Omega Squadron Ace"""
           text: """<i class = flavor_text>Only pilots who have demonstrated both exceptional skill and unwavering dedication are rewarded with coveted positions in the First Order squadrons operating secretly against the New Republic during the Cold War.</i>"""
        "Omega Squadron Expert":
           display_name: """Omega Squadron Expert"""
           text: """<i class = flavor_text>The TIE/sf is a versatile starfighter that carries specialized armament and experimental systems for long-range operations by First Order Special Forces.</i>%LINEBREAK%<strong>Heavy Weapon Turret:</strong> You can rotate your %SINGLETURRETARC% indicator only to your %FRONTARC% or %REARARC%. You <b>must</b> treat the %FRONTARC% requirement of your equipped %MISSILE% upgrades as %SINGLETURRETARC%."""
        "Omicron Group Pilot":
           display_name: """Omicron Group Pilot"""
           text: """<i class = flavor_text>Noted for its tri-wing design and advanced sensor suite, the Lambda-class shuttle serves a critical role as a light utility craft in the Imperial Navy.</i>"""
        "Onyx Squadron Ace":
           display_name: """Onyx Squadron Ace"""
           text: """<i class = flavor_text>The experimental TIE defender outclasses all other contemporary starfighters, though its size, speed, and array of weapons come at a tremendous cost in credits.</i>%LINEBREAK%<strong>Full Throttle:</strong> After you fully execute a speed 3-5 maneuver, you may perform an %EVADE% action."""
        "Onyx Squadron Scout":
           display_name: """Onyx Squadron Scout"""
           text: """<i class = flavor_text>Designed for extended engagements, the TIE/ag is flown primarily by elite pilots trained to leverage both its unique weapons loadout and its maneuverability to full effect.</i>"""
        "Outer Rim Pioneer":
           display_name: """Outer Rim Pioneer"""
           text: """Friendly ships at range 0-1 can perform attacks at range 0 of obstacles.%LINEBREAK%<strong>Co-Pilot:</strong> While you are docked, your carrier ship has your pilot ability in addition to its own."""
        "Outer Rim Smuggler":
           display_name: """Outer Rim Smuggler"""
           text: """<i class = flavor_text>Known for its durability and modular design, the YT-1300 is one of the most popular, widely used, and extensively customized freighters in the galaxy.</i>"""
        "Overseer Yushyn":
           display_name: """Overseer Yushyn"""
           text: """Before a friendly ship at range 1 would gain a disarm token, if that ship is not stressed, you may spend 1&nbsp;%CHARGE%. If you do, that ship gains 1 stress token instead.%LINEBREAK%<strong>Notched Stabilizers:</strong> While you move, you ignore asteroids."""
        "Padmé Amidala":
           display_name: """Padmé Amidala"""
           text: """While an enemy ship in your %FRONTARC% defends or performs an attack that ship can modify only 1 %EVADE% result (other results can still be modified). %LINEBREAK%<strong>Full Throttle:</strong> After you fully execute a speed 3-5 maneuver, you may perform an %EVADE% action."""
        "Palob Godalhi":
           display_name: """Palob Godalhi"""
           text: """At the start of the Engagement Phase, you may choose 1 enemy ship in your firing arc at range 0-2. If you do, transfer 1 focus or evade token from that ship to yourself."""
        "Pammich Nerro Goode":
           text: """While you have 2 or fewer stress tokens, you may execute red maneuvers even while stressed"""
        "Partisan Renegade":
           display_name: """Partisan Renegade"""
           text: """<i class = flavor_text>Saw Gerrera’s partisans were first established to oppose Separatist forces on Onderon during the Clone Wars, and continued to wage war against galactic tyranny as the Empire rose to power.</i>"""
        "Patrol Leader":
           display_name: """Patrol Leader"""
           text: """<i class = flavor_text>To be granted command of a VT-49 Decimator is seen as a significant promotion for a middling officer of the Imperial Navy.</i>"""
        "Petty Officer Thanisson":
           display_name: """Petty Officer Thanisson"""
           text: """During the Activation or Engagement Phase, after a ship in your %FRONTARC% at range&nbsp;0-2 gains 1 stress token, you may spend 1&nbsp;%CHARGE%. If you do, that ship gains 1&nbsp;tractor token.%LINEBREAK%<strong>Linked Battery:</strong> While you perform a %CANNON% attack, roll 1 additional die."""
        "Phoenix Squadron Pilot":
           display_name: """Phoenix Squadron Pilot"""
           text: """<i class = flavor_text>Led by Commander Jun Sato, the brave but inexperienced pilots of Phoenix Squadron face staggering odds in their battle against the Galactic Empire.</i>%LINEBREAK%<strong>Vectored Thrusters:</strong> After you perform an action, you may perform a red %BOOST% action."""
        "Planetary Sentinel":
           display_name: """Planetary Sentinel"""
           text: """<i class = flavor_text>To protect its many military installations, the Empire requires a swift and vigilant defense force.</i>%LINEBREAK% <strong>Adaptive Ailerons:</strong> Before you reveal your dial, if you are not stressed, you <b>must</b> execute a white [1&nbsp;%BANKLEFT%], [1&nbsp;%STRAIGHT%], or [1&nbsp;%BANKRIGHT%] maneuver."""
        "Plo Koon":
           display_name: """Plo Koon"""
           text: """At the start of the Engagement Phase, you may spend 1 %FORCE% and choose another friendly ship at range 0-2. If you do, you may transfer 1 green token to it or transfer one orange token from it to yourself.%LINEBREAK%<strong>Fine-tuned Controls:</strong> After you fully execute a maneuver, you may spend 1&nbsp;%FORCE% to perform a %BOOST% or %BARRELROLL% action."""
        "Poe Dameron":
           display_name: """Poe Dameron"""
           text: """After you perform an action, you may spend 1&nbsp;%CHARGE% to perform a white action, treating it as red.%LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1&nbsp;%CANNON%, %TORPEDO%, or %MISSILE% upgrade."""
        "Prince Xizor":
           display_name: """Prince Xizor"""
           text: """While you defend, after the Neutralize Results step, another friendly ship at range 0-1 and in the attack arc may suffer 1&nbsp;%HIT% or %CRIT% damage. If it does, cancel 1 matching result.%LINEBREAK%<strong>Microthrusters:</strong> While you perform a barrel roll, you <b>must</b> use the %BANKLEFT% or %BANKRIGHT% template instead of the %STRAIGHT% template."""
        "Quinn Jast":
           display_name: """Quinn Jast"""
           text: """At the start of the Engagement Phase, you may gain 1 disarm token to recover 1&nbsp;%CHARGE% on 1 of your equipped upgrades. %LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1 %CANNON%, %TORPEDO%, or %MISSILE% upgrade."""
        "Rear Admiral Chiraneau":
           display_name: """Rear Admiral Chiraneau"""
           text: """While you perform an attack, if you are reinforced and the defender is in the %FULLFRONTARC% or %FULLREARARC% matching your reinforce token, you may change 1 of your %FOCUS% results to a %CRIT% result."""
        "Rebel Scout":
           display_name: """Rebel Scout"""
           text: """<i class = flavor_text>Designed to look like a bird in flight by the Corellian Engineering Corporation, “hawk” series ships are exemplary transport craft. Swift and rugged, the HWK-290 is often employed by Rebel agents as a mobile base of operations.</i>"""
        "Red Squadron Expert":
           display_name: """Red Squadron Expert"""
           text: """<i class = flavor_text>Although the bulk of the Resistance Starfighter Corps is made up of young volunteers from the New Republic, their ranks are bolstered by veterans of the Galactic Civil War determined to finish what they started decades ago.</i>%LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1&nbsp;%CANNON%, %TORPEDO%, or %MISSILE% upgrade."""
        "Red Squadron Veteran":
           display_name: """Red Squadron Veteran"""
           text: """<i class = flavor_text>Created as an elite starfighter squad, Red Squadron includes some of the best pilots in the Rebel Alliance.</i>"""
        "Resistance Sympathizer":
           display_name: """Resistance Sympathizer"""
           text: """<i class = flavor_text>After witnessing the Hosnian Cataclysm, some spacers willingly aided the Resistance with whatever ships they had.</i>"""
        "Rexler Brath":
           display_name: """Rexler Brath"""
           text: """After you perform an attack that hits, if you are evading, expose 1 of the defender’s damage cards.%LINEBREAK%<strong>Full Throttle:</strong> After you fully execute a speed 3-5 maneuver, you may perform an %EVADE% action."""
        "Rey":
           display_name: """Rey"""
           text: """While you defend or perform an attack, if the enemy ship is in your %FRONTARC%, you may spend 1&nbsp;%FORCE% to change 1 of your blank results to an %EVADE% or %HIT% result."""
        "Rho Squadron Pilot":
           display_name: """Rho Squadron Pilot"""
           text: """<i class = flavor_text>The elite pilots of Rho Squadron instill terror in the Rebellion, using both the Xg-1 assault configuration and Os-1 arsenal loadout of the Alpha-class star wing to devastating effect.</i>"""
        "Roark Garnet":
           display_name: """Roark Garnet"""
           text: """At the start of the Engagement Phase, you may choose 1 ship in your firing arc. If you do, it engages at initiative 7 instead of its standard initiative value this phase."""
        "Rogue Squadron Escort":
           display_name: """Rogue Squadron Escort"""
           text: """<i class = flavor_text>The elite pilots of Rogue Squadron are among the Rebellion’s very best.</i> %LINEBREAK% <strong>Experimental Scanners:</strong> You can acquire locks beyond range 3. You cannot acquire locks at range 1."""
        "Rose Tico":
           text: """While you defend or perform an attack, you may reroll up to 1 of your results for each other friendly ship in the attack arc."""
        "Saber Squadron Ace":
           display_name: """Saber Squadron Ace"""
           text: """<i class = flavor_text>Led by Baron Soontir Fel, the pilots of Saber Squadron are among the Empire’s best. Their TIE interceptors are marked with red stripes to designate pilots with at least ten confirmed kills. </i> %LINEBREAK%  <strong> Autothrusters:</strong> After you perform an action, you may perform a red %BARRELROLL% or red %BOOST% action."""
        "Sabine Wren":
           display_name: """Sabine Wren"""
           text: """Before you activate, you may perform a %BARRELROLL% or %BOOST% action.%LINEBREAK%<strong>Locked and Loaded:</strong> While you are docked, after your carrier ship performs a primary %FRONTARC% or %TURRET% attack, it may perform a bonus primary %REARARC% attack."""
        "Sabine Wren (TIE Fighter)":
           display_name: """Sabine Wren"""
           text: """Before you activate, you may perform a %BARRELROLL% or %BOOST% action."""
        "Sabine Wren (Scum)":
           display_name: """Sabine Wren"""
           text: """While you defend, if the attacker is in your %SINGLETURRETARC% at range 0-2, you may add 1&nbsp;%FOCUS% result to your dice results."""
        "Saesee Tiin":
           display_name: """Saesee Tiin"""
           text: """After a friendly ship at range 0-2 reveals its dial, you may spend 1 %FORCE%. If you do, set its dial to another maneuver of the same speed and difficulty.%LINEBREAK%<strong>Fine-tuned Controls:</strong> After you fully execute a maneuver, you may spend 1&nbsp;%FORCE% to perform a %BOOST% or %BARRELROLL% action."""
        "Sarco Plank":
           display_name: """Sarco Plank"""
           text: """While you defend, you may treat your agility value as equal to the speed of the maneuver you executed this round.%LINEBREAK%<strong>Spacetug Tractor Array:</strong> <strong>Action:</strong> Choose a ship in your %FRONTARC% at range 1. That ship gains 1 tractor token, or 2 tractor tokens if it is in your %BULLSEYEARC% at range 1."""
        "Saw Gerrera":
           display_name: """Saw Gerrera"""
           text: """While a damaged friendly ship at range 0-3 performs an attack, it may reroll 1 attack die."""
        "Scarif Base Pilot":
           display_name: """Scarif Base Pilot"""
           text: """<i class = flavor_text>The TIE reaper was designed to ferry elite troops to flashpoints on the battlefield, notably carrying Director Krennic’s dreaded death troopers at the Battle of Scarif.</i>%LINEBREAK%<strong>Adaptive Ailerons:</strong> Before you reveal your dial, if you are not stressed, you <b>must</b> execute a white [1&nbsp;%BANKLEFT%], [1&nbsp;%STRAIGHT%], or [1&nbsp;%BANKRIGHT%] maneuver."""
        "Scimitar Squadron Pilot":
           display_name: """Scimitar Squadron Pilot"""
           text: """<i class = flavor_text>The TIE/sa is exceptionally nimble for a bomber, allowing it to pinpoint its target while avoiding excessive collateral damage to the surrounding area.</i> %LINEBREAK%<strong>Nimble Bomber:</strong> If you would drop a device using a %STRAIGHT% template, you may use a %BANKLEFT% or %BANKRIGHT% template of the same speed instead."""
        "Separatist Bomber":
           display_name: """Separatist Bomber"""
           text: """<i class = flavor_text>The droid armies of the Separatists are callous to the plight of civilians and make no effort to limit collateral damage.</i>%LINEBREAK%<strong>Networked Calculations:</strong> While you defend or perform an attack, you may spend 1 calculate token from a friendly ship at range&nbsp;0-1 to change 1&nbsp;%FOCUS% result to an %EVADE% or %HIT% result."""
        "Separatist Drone":
           display_name: """Separatist Drone"""
           text: """<i class = flavor_text>As the Clone Wars escalate, the Separatist Alliance continues to develop the technology of droid starfighters, as well as the tactical droids that command them.</i>%LINEBREAK%<strong>Networked Calculations:</strong> While you defend or perform an attack, you may spend 1 calculate token from a friendly ship at range&nbsp;0-1 to change 1&nbsp;%FOCUS% result to an %EVADE% or %HIT% result."""
        "Serissu":
           display_name: """Serissu"""
           text: """While a friendly ship at range 0-1 defends, it may reroll 1 of its dice.%LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1 %CANNON%, %TORPEDO%, or %MISSILE% upgrade."""
        "Seventh Sister":
           display_name: """Seventh Sister"""
           text: """While you perform a primary attack, before the Neutralize Results step, you may spend 2&nbsp;%FORCE% to cancel 1&nbsp;%EVADE% result."""
        "Seyn Marana":
           display_name: """Seyn Marana"""
           text: """While you perform an attack, you may spend 1&nbsp;%CRIT% result. If you do, deal 1 facedown damage card to the defender, then cancel your remaining results."""
        "Shadowport Hunter":
           display_name: """Shadowport Hunter"""
           text: """<i class = flavor_text>Crime syndicates augment the lethal skills of their loyal contractors with the best technology available, like the fast and formidable Lancer-class pursuit craft.</i>"""
        "Shara Bey":
           display_name: """Shara Bey"""
           text: """While you defend or perform a primary attack, you may spend 1 lock you have on the enemy ship to add 1&nbsp;%FOCUS% result to your dice results."""
        "Sienar Specialist":
           display_name: """Sienar Specialist"""
           text: """<i class = flavor_text>During the development of the TIE aggressor, Sienar Fleet Systems valued performance and versatility over raw cost efficiency.</i>"""
        "Sienar-Jaemus Engineer":
           display_name: """Sienar-Jaemus Engineer"""
           text: """<i class = flavor_text>Developed by Sienar-Jaemus Fleet Systems as a successor to the vaunted TIE Defender, the TIE/vn Silencer incorporates bleeding-edge technologies developed at research facilities hidden in the Unknown Regions.</i>%LINEBREAK%<strong>Autothrusters:</strong> After you perform an action, you may perform a red %BARRELROLL% or red %BOOST% action."""
        "Sigma Squadron Ace":
           display_name: """Sigma Squadron Ace"""
           text: """<i class = flavor_text>Featuring a hyperdrive and shields, the TIE phantom is also equipped with five laser cannons, giving it substantial firepower for an Imperial fighter.</i>%LINEBREAK%<strong>Stygium Array:</strong> After you decloak, you may perform an %EVADE% action. At the start of the End Phase, you may spend 1 evade token to gain 1 cloak token."""
        "Skakoan Ace":
           display_name: """Skakoan Ace"""
           text: """<i class = flavor_text>With its powerful engines, devastating triple laser cannons, and high customizability, the Belbullab-22 is the chosen craft of several elite Separatist Alliance pilots, including the infamous General Grievous.</i>"""
        "Skull Squadron Pilot":
           display_name: """Skull Squadron Pilot"""
           text: """<i class = flavor_text>The aces of Skull Squadron favor an aggressive approach, using their craft’s pivot wing technology to achieve unmatched agility in the pursuit of their quarry.</i> %LINEBREAK% <strong>Concordia Faceoff:</strong> While you defend, if the attack range is 1 and you are in the attacker’s %FRONTARC%, change 1 result to an %EVADE% result."""
        "Sol Sixxa":
           display_name: """Sol Sixxa"""
           text: """If you would drop a device using a [1&nbsp;%STRAIGHT%] template, you may drop it using any speed 1 template instead."""
        "Soontir Fel":
           display_name: """Soontir Fel"""
           text: """At the start of the Engagement Phase, if there is an enemy ship in your %BULLSEYEARC%, gain 1 focus token.%LINEBREAK%<strong>Autothrusters:</strong> After you perform an action, you may perform a red %BARRELROLL% or red %BOOST% action."""
        "Spice Runner":
           display_name: """Spice Runner"""
           text: """<i class = flavor_text>Though its cargo space is limited compared to other light freighters, the small, swift HWK-290 is a favorite choice of smugglers who specialize in discreetly transporting precious goods.</i>"""
        "Squad Seven Veteran":
           display_name: """Squad Seven Veteran"""
           text: """<i class = flavor_text>Clone Flight Seven serves as part of the Open Circle Fleet under legendary Jedi Generals such as Plo Koon and Obi-Wan Kenobi, and won glory at the battles of Coruscant and Cato Neimoidia.</i>"""
        "Starkiller Base Pilot":
           display_name: """Starkiller Base Pilot"""
           text: """<i class = flavor_text>The Upsilon-class command shuttle serves as a base of operations for many of the First Order's senior officers and agents. Its powerful sensors and communications equipment allow them to orchestrate the spread of terror across the galaxy.</i>%LINEBREAK%<strong>Linked Battery:</strong> While you perform a %CANNON% attack, roll 1 additional die."""
        "Storm Squadron Ace":
           display_name: """Storm Squadron Ace"""
           text: """<i class = flavor_text>The TIE Advanced x1 was produced in limited quantities, but Sienar engineers incorporated many of its best qualities into their next TIE model: the TIE Interceptor.</i>%LINEBREAK%<strong>Advanced Targeting Computer:</strong> While you perform a primary attack against a defender you have locked, roll 1 additional attack die and change 1&nbsp;%HIT% result to a %CRIT% result."""
        "Sunny Bounder":
           display_name: """Sunny Bounder"""
           text: """While you defend or perform an attack, after you roll or reroll your dice, if you have the same result on each of your dice, you may add 1 matching result.%LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1 %CANNON%, %TORPEDO%, or %MISSILE% upgrade."""
        "TN-3465":
           display_name: """TN-3465"""
           text: """While another friendly ship performs an attack, if you are at range 0-1 of the defender, you may suffer 1&nbsp;%CRIT% damage to change 1 of the attacker’s results to a %CRIT% result."""
        "Tala Squadron Pilot":
           display_name: """Tala Squadron Pilot"""
           text: """<i class = flavor_text>The AF4 series is the latest in a long line of Headhunter designs. Cheap and relatively durable, it is a favorite among independent outfits like the Rebellion.</i>"""
        "Tallissan Lintra":
           display_name: """Tallissan Lintra"""
           text: """While an enemy ship in your %BULLSEYEARC% performs an attack, you may spend 1&nbsp;%CHARGE%.  If you do, the defender rolls 1 additional die.%LINEBREAK%<strong>Refined Gyrostabilizers:</strong> You can rotate your %SINGLETURRETARC% indicator only to your %FRONTARC% or %REARARC%. After you perform an action, you may perform a red %BOOST% or red %ROTATEARC% action."""
        "Talonbane Cobra":
           display_name: """Talonbane Cobra"""
           text: """While you defend at attack range 3 or perform an attack at attack range 1, roll 1 additional die."""
        "Tansarii Point Veteran":
           display_name: """Tansarii Point Veteran"""
           text: """<i class = flavor_text>The defeat of Black Sun ace Talonbane Cobra by Car’das smugglers turned the tide of the Battle of Tansarii Point Station. Survivors of the clash are respected throughout the sector.</i> %LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1 %CANNON%, %TORPEDO%, or %MISSILE% upgrade."""
        "Techno Union Bomber":
           display_name: """Techno Union Bomber"""
           text: """<i class = flavor_text>Baktoid Armor Workshop developed the Hyena as a strike craft compatible with Trade Federation Vulture swarm tactics.</i>%LINEBREAK%<strong>Networked Calculations:</strong> While you defend or perform an attack, you may spend 1 calculate token from a friendly ship at range&nbsp;0-1 to change 1&nbsp;%FOCUS% result to an %EVADE% or %HIT% result."""
        "Tel Trevura":
           display_name: """Tel Trevura"""
           text: """If you would be destroyed, you may spend 1&nbsp;%CHARGE%. If you do, discard all of your damage cards, suffer 5&nbsp;%HIT% damage, and place yourself in reserves instead. At the start of the next Planning Phase, place yourself within range 1 of your player edge."""
        "Temmin Wexley":
           display_name: """Temmin Wexley"""
           text: """After you fully execute a speed 2-4 maneuver, you may perform a %BOOST% action.%LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1&nbsp;%CANNON%, %TORPEDO%, or %MISSILE% upgrade."""
        "Tempest Squadron Pilot":
           display_name: """Tempest Squadron Pilot"""
           text: """<i class = flavor_text>The TIE Advanced improved on the popular TIE/ln design by adding shielding, better weapons systems, curved solar panels, and a hyperdrive.</i>%LINEBREAK%<strong>Advanced Targeting Computer:</strong> While you perform a primary attack against a defender you have locked, roll 1 additional attack die and change 1&nbsp;%HIT% result to a %CRIT% result."""
        "Ten Numb":
           display_name: """Ten Numb"""
           text: """While you defend or perform an attack, you may spend 1 stress token to change all of your %FOCUS% results to %EVADE% or %HIT% results."""
        "Thane Kyrell":
           display_name: """Thane Kyrell"""
           text: """While you perform an attack, you may spend 1&nbsp;%FOCUS%, %HIT%, or %CRIT% result to look at the defender’s facedown damage cards, choose 1, and expose it."""
        "Tomax Bren":
           display_name: """Tomax Bren"""
           text: """After you perform a %RELOAD% action, you may recover 1&nbsp;%CHARGE% token on 1 of your equipped %TALENT% upgrade cards. %LINEBREAK%<strong>Nimble Bomber:</strong> If you would drop a device using a %STRAIGHT% template, you may use a %BANKLEFT% or %BANKRIGHT% template of the same speed instead."""
        "Torani Kulda":
           display_name: """Torani Kulda"""
           text: """After you perform an attack, each enemy ship in your %BULLSEYEARC% suffers 1&nbsp;%HIT% damage unless it removes 1 green token.%LINEBREAK%<strong>Dead to Rights:</strong> While you perform an attack, if the defender is in your %BULLSEYEARC%, defense dice cannot be modified using green tokens."""
        "Torkil Mux":
           display_name: """Torkil Mux"""
           text: """At the start of the Engagement Phase, you may choose 1 ship in your firing arc. If you do, that ship engages at initiative 0 instead of its normal initiative value this round."""
        "Trade Federation Drone":
           display_name: """Trade Federation Drone"""
           text: """<i class = flavor_text>The Trade Federation deployed countless Vulture Droids at the Battle of Naboo, and continues to use these inexpensive starfighters in the Clone Wars.</i>%LINEBREAK%<strong>Networked Calculations:</strong> While you defend or perform an attack, you may spend 1 calculate token from a friendly ship at range&nbsp;0-1 to change 1&nbsp;%FOCUS% result to an %EVADE% or %HIT% result."""
        "Trandoshan Slaver":
           display_name: """Trandoshan Slaver"""
           text: """<i class = flavor_text>The spacious triple-decker design of the YV-666 makes it popular among bounty hunters and slavers, who often retrofit an entire deck for prisoner transport.</i>"""
        "Turr Phennir":
           display_name: """Turr Phennir"""
           text: """After you perform an attack, you may perform a %BARRELROLL% or %BOOST% action, even if you are stressed.%LINEBREAK%<strong>Autothrusters:</strong> After you perform an action, you may perform a red %BARRELROLL% or red %BOOST% action."""
        "Unkar Plutt":
           display_name: """Unkar Plutt"""
           text: """At the start of the Engagement Phase, if there are one or more other ships at range 0, you and each other ship at range 0 gain 1 tractor token.%LINEBREAK%<strong>Spacetug Tractor Array:</strong> <strong>Action:</strong> Choose a ship in your %FRONTARC% at range 1. That ship gains 1 tractor token, or 2 tractor tokens if it is in your %BULLSEYEARC% at range 1."""
        "Valen Rudor":
           display_name: """Valen Rudor"""
           text: """After a friendly ship at range 0-1 defends (after damage is resolved, if any), you may perform an action."""
        "Ved Foslo":
           display_name: """Ved Foslo"""
           text: """While you execute a maneuver, you may execute a maneuver of the same bearing and difficulty of a speed 1 higher or lower instead.%LINEBREAK%<strong>Advanced Targeting Computer:</strong> While you perform a primary attack against a defender you have locked, roll 1 additional attack die and change 1&nbsp;%HIT% result to a %CRIT% result."""
        "Vennie":
           display_name: """Vennie"""
           text: """While you defend, if the attacker is in a friendly ship’s %SINGLETURRETARC%, you may add 1 %FOCUS% result to your roll."""
        "Viktor Hel":
           display_name: """Viktor Hel"""
           text: """After you defend, if you did not roll exactly 2 defense dice, the attacker gains 1 stress token."""
        "Warden Squadron Pilot":
           display_name: """Warden Squadron Pilot"""
           text: """<i class = flavor_text>Koensayr Manufacturing’s K-wing boasts an advanced SubLight Acceleration Motor and an unprecedented 18 hard points, granting it unrivaled speed and firepower.</i>"""
        "Wat Tambor":
           display_name: """Wat Tambor"""
           text: """While you perform a primary attack, you may reroll 1 attack die for each calculating friendly ship at range&nbsp;1 of the defender."""
        "Wedge Antilles":
           display_name: """Wedge Antilles"""
           text: """While you perform an attack, the defender rolls 1 fewer defense die."""
        "Wild Space Fringer":
           display_name: """Wild Space Fringer"""
           text: """<i class = flavor_text>Although stock YT-2400 light freighters have plenty of room for cargo, that space is often annexed to support modified weapon systems and oversized engines.</i>%LINEBREAK%<strong>Sensor Blindspot:</strong> While you perform a primary attack at attack range 0-1, do not apply the range 0-1 bonus and roll 1 fewer attack die."""
        "Wullffwarro":
           display_name: """Wullffwarro"""
           text: """While you perform a primary attack, if you are damaged, you may roll 1 additional attack die."""
        "Zari Bangel":
           display_name: """Zari Bangel"""
           text: """You do not skip your Perform Action step after you partially execute a maneuver.%LINEBREAK%<strong>Refined Gyrostabilizers:</strong> You can rotate your %SINGLETURRETARC% indicator only to your %FRONTARC% or %REARARC%. After you perform an action, you may perform a red %BOOST% or red %ROTATEARC% action."""
        "Zealous Recruit":
           display_name: """Zealous Recruit"""
           text: """<i class = flavor_text>Mandalorian Fang fighter pilots must master the Concordia Faceoff maneuver, leveraging their ships’ narrow attack profile to execute deadly head-on charges.</i> %LINEBREAK% <strong>Concordia Faceoff:</strong> While you defend, if the attack range is 1 and you are in the attacker’s %FRONTARC%, change 1 result to an %EVADE% result."""
        "Zertik Strom":
           display_name: """Zertik Strom"""
           text: """During the End Phase, you may spend a lock you have on an enemy ship to expose 1 of that ship’s damage cards.%LINEBREAK%<strong>Advanced Targeting Computer:</strong> While you perform a primary attack against a defender you have locked, roll 1 additional attack die and change 1&nbsp;%HIT% result to a %CRIT% result."""
        "Zeta Squadron Pilot":
           display_name: """Zeta Squadron Pilot"""
           text: """<i class = flavor_text>Unhampered by a cumbersome galactic bureaucracy, technologies originally researched by the Empire’s TIE Advanced program are now mass-produced on First Order starfighters. As a result, TIE/fo pilots enjoy higher survival rates than their predecessors in the Galactic Empire.</i>"""
        "Zeta Squadron Survivor":
           display_name: """Zeta Squadron Survivor"""
           text: """<i class = flavor_text>Humiliated by their failure, the remaining pilots from Starkiller Base are eager to prove their worth in pursuit of the Resistance.</i>%LINEBREAK%<strong>Heavy Weapon Turret:</strong> You can rotate your %SINGLETURRETARC% indicator only to your %FRONTARC% or %REARARC%. You <b>must</b> treat the %FRONTARC% requirement of your equipped %MISSILE% upgrades as %SINGLETURRETARC%."""
        "Zuckuss":
           display_name: """Zuckuss"""
           text: """While you perform a primary attack, you may roll 1 additional attack die. If you do, the defender rolls 1 additional defense die."""
        '"Avenger"':
           display_name: """“Avenger”"""
           text: """After another friendly ship is destroyed, you may perform an action, even while stressed.%LINEBREAK%<strong>Autothrusters:</strong> After you perform an action, you may perform a red %BARRELROLL% or red %BOOST% action."""
        '"Axe"':
           display_name: """“Axe”"""
           text: """After you defend or perform an attack, you may choose a friendly ship at range&nbsp;1-2 in your %LEFTARC%  or %RIGHTARC%. If you do, transfer 1 green token to that ship."""
        '"Backdraft"':
           display_name: """“Backdraft”"""
           text: """While you perform a %SINGLETURRETARC% primary attack, if the defender is in your %REARARC%, roll 1 additional die.%LINEBREAK%<strong>Heavy Weapon Turret:</strong> You can rotate your %SINGLETURRETARC% indicator only to your %FRONTARC% or %REARARC%. You <b>must</b> treat the %FRONTARC% requirement of your equipped %MISSILE% upgrades as %SINGLETURRETARC%."""
        '"Blackout"':
           display_name: """“Blackout”"""
           text: """While you perform an attack, if the attack is obstructed by an obstacle, the defender rolls 2 fewer defense dice.%LINEBREAK%<strong>Autothrusters:</strong> After you perform an action, you may perform a red %BARRELROLL% or red %BOOST% action."""
        '"Chopper"':
           display_name: """“Chopper”"""
           text: """At the start of the Engagement Phase, each enemy ship at range 0 gains 2 jam tokens. %LINEBREAK%<strong>Tail Gun:</strong> While you have a docked ship, you have a primary %REARARC% weapon with an attack value equal to your docked ship’s primary %FRONTARC% attack value."""
        '"Countdown"':
           display_name: """“Countdown”"""
           text: """While you defend, after the Neutralize Results step, if you are not stressed, you may suffer 1&nbsp;%HIT% damage and gain 1 stress token. If you do, cancel all dice results.%LINEBREAK%<strong>Adaptive Ailerons:</strong> Before you reveal your dial, if you are not stressed, you <b>must</b> execute a white [1&nbsp;%BANKLEFT%], [1&nbsp;%STRAIGHT%], or [1&nbsp;%BANKRIGHT%] maneuver."""
        '"Deathfire"':
           display_name: """“Deathfire”"""
           text: """After you are destroyed, before you are removed, you may perform an attack and drop or launch 1 device.%LINEBREAK%<strong>Nimble Bomber:</strong> If you would drop a device using a %STRAIGHT% template, you may use a %BANKLEFT% or %BANKRIGHT% template of the same speed instead."""
        '"Deathrain"':
           display_name: """“Deathrain”"""
           text: """After you drop or launch a device, you may perform an action."""
        '"Double Edge"':
           display_name: """“Double Edge”"""
           text: """After you perform a %TURRET% or %MISSILE% attack that misses, you may perform a bonus attack using a different weapon."""
        '"Duchess"':
           display_name: """“Duchess”"""
           text: """You may choose not to use your <strong>Adaptive Ailerons</strong>. %LINEBREAK%You may use your <strong>Adaptive Ailerons</strong> even while stressed.%LINEBREAK%<strong>Adaptive Ailerons:</strong> Before you reveal your dial, if you are not stressed, you <b>must</b> execute a white [1&nbsp;%BANKLEFT%], [1&nbsp;%STRAIGHT%], or [1&nbsp;%BANKRIGHT%] maneuver."""
        '"Dutch" Vander':
           display_name: """“Dutch” Vander"""
           text: """After you perform the %LOCK% action, you may choose 1 friendly ship at range 1-3. That ship may acquire a lock on the object you locked, ignoring range restrictions."""
        '"Echo"':
           display_name: """“Echo”"""
           text: """While you decloak, you <b>must</b> use the [2&nbsp;%BANKLEFT%] or [2&nbsp;%BANKRIGHT%] template instead of the [2&nbsp;%STRAIGHT%] template.%LINEBREAK%<strong>Stygium Array:</strong> After you decloak, you may perform an %EVADE% action. At the start of the End Phase, you may spend 1 evade token to gain 1 cloak token."""
        '"Howlrunner"':
           display_name: """“Howlrunner”"""
           text: """While a friendly ship at range 0-1 performs a primary attack, that ship may reroll 1 attack die."""
        '"Jag"':
           display_name: """“Jag”"""
           text: """After a friendly ship at range&nbsp;1-2 in your %LEFTARC%  or %RIGHTARC%  defends, you may acquire a lock on the attacker."""
        '"Kickback"':
           display_name: """“Kickback”"""
           text: """After you perform a %BARRELROLL% action, you may perform a red %LOCK% action."""
        '"Leebo"':
           display_name: """“Leebo”"""
           text: """After you defend or perform an attack, if you spent a calculate token, gain 1 calculate token.%LINEBREAK%<strong>Sensor Blindspot:</strong> While you perform a primary attack at attack range 0-1, do not apply the range 0-1 bonus and roll 1 fewer attack die."""
        '"Longshot"':
           display_name: """“Longshot”"""
           text: """While you perform a primary attack at attack range 3, roll 1 additional attack die."""
        '"Mauler" Mithel':
           display_name: """“Mauler” Mithel"""
           text: """While you perform an attack at attack range 1, roll 1 additional attack die."""
        '"Midnight"':
           display_name: """“Midnight”"""
           text: """While you defend or perform an attack, if you have a lock on the enemy ship, that ship’s dice cannot be modified."""
        '"Muse"':
           display_name: """“Muse”"""
           text: """At the start of the Engagement Phase, you may choose a friendly ship at range&nbsp;0-1. If you do, that ship removes 1&nbsp;stress token."""
        '"Night Beast"':
           display_name: """“Night Beast”"""
           text: """After you fully execute a blue maneuver, you may perform a %FOCUS% action."""
        '"Null"':
           display_name: """“Null”"""
           text: """While you are not damaged, treat your initiative value as 7."""
        '"Odd Ball"':
           display_name: """“Odd Ball”"""
           text: """After you fully execute a red maneuver or perform a red action, if there is an enemy ship in your %BULLSEYEARC%, you may acquire a lock on that ship."""
        '"Odd Ball" (ARC-170)':
           display_name: """“Odd Ball”"""
           text: """After you fully execute a red maneuver or perform a red action, if there is an enemy ship in your %BULLSEYEARC%, you may acquire a lock on that ship."""
        '"Pure Sabacc"':
           display_name: """“Pure Sabacc”"""
           text: """While you perform an attack, if you have 1 or fewer damage cards, you may roll 1 additional attack die.%LINEBREAK%<strong>Adaptive Ailerons:</strong> Before you reveal your dial, if you are not stressed, you <b>must</b> execute a white [1&nbsp;%BANKLEFT%], [1&nbsp;%STRAIGHT%], or [1&nbsp;%BANKRIGHT%] maneuver."""
        '"Quickdraw"':
           display_name: """“Quickdraw”"""
           text: """After you lose a shield, you may spend 1&nbsp;%CHARGE%. If you do, you may perform a bonus primary attack.%LINEBREAK%<strong>Heavy Weapon Turret:</strong> You can rotate your %SINGLETURRETARC% indicator only to your %FRONTARC% or %REARARC%. You <b>must</b> treat the %FRONTARC% requirement of your equipped %MISSILE% upgrades as %SINGLETURRETARC%."""
        '"Recoil"':
           display_name: """“Recoil”"""
           text: """While you are stressed, you may treat enemy ships in your %FRONTARC% at range 0-1 as being in your %BULLSEYEARC%.%LINEBREAK%<strong>Autothrusters:</strong> After you perform an action, you may perform a red %BARRELROLL% or red %BOOST% action."""
        '"Redline"':
           display_name: """“Redline”"""
           text: """You can maintain up to 2 locks. %LINEBREAK%After you perform an action, you may acquire a lock."""
        '"Scorch"':
           display_name: """“Scorch”"""
           text: """While you perform a primary attack, if you are not stressed, you may gain 1 stress token to roll 1 additional attack die."""
        '"Scourge" Skutu':
           display_name: """“Scourge” Skutu"""
           text: """While you perform an attack against a defender in your %BULLSEYEARC%, roll 1 additional attack die."""
        '"Sinker"':
           display_name: """“Sinker”"""
           text: """While a friendly ship at range&nbsp;1-2 in your %LEFTARC% or %RIGHTARC% performs a primary attack, it may reroll 1&nbsp;attack die."""
        '"Static"':
           display_name: """“Static”"""
           text: """While you perform a primary attack, you may spend your lock on the defender and a focus token to change all of your results to %CRIT% results."""
        '"Swoop"':
           display_name: """“Swoop”"""
           text: """After a friendly small or medium ship fully executes a speed 3-4 maneuver, if it is at range&nbsp;0-1, it may perform a red %BOOST% action."""
        '"Tucker"':
           display_name: """“Tucker”"""
           text: """After a friendly ship at range&nbsp;1-2 performs an attack against an enemy ship in your %FRONTARC%, you may perform a %FOCUS%&nbsp;action."""
        '"Vizier"':
           display_name: """“Vizier”"""
           text: """After you fully execute a speed 1 maneuver using your <strong>Adaptive Ailerons</strong> ship ability, you may perform a %COORDINATE% action. If you do, skip your Perform Action step.%LINEBREAK%<strong>Adaptive Ailerons:</strong> Before you reveal your dial, if you are not stressed, you <b>must</b> execute a white [1&nbsp;%BANKLEFT%], [1&nbsp;%STRAIGHT%], or [1&nbsp;%BANKRIGHT%] maneuver."""
        '"Wampa"':
           display_name: """“Wampa”"""
           text: """While you perform an attack, you may spend 1&nbsp;%CHARGE% to roll 1 additional attack die.%LINEBREAK%After defending, lose 1&nbsp;%CHARGE%."""
        '"Whisper"':
           display_name: """“Whisper”"""
           text: """After you perform an attack that hits, gain 1 evade token.%LINEBREAK%<strong>Stygium Array:</strong> After you decloak, you may perform an %EVADE% action. At the start of the End Phase, you may spend 1 evade token to gain 1 cloak token."""
        '"Wolffe"':
           display_name: """“Wolffe”"""
           text: """While you perform a primary %FRONTARC% attack, you may spend 1 %CHARGE% to reroll 1&nbsp;attack die. %LINEBREAK%While you perform a primary %REARARC% attack, you may recover 1&nbsp;%CHARGE% to roll 1&nbsp;additional attack die. """
        '"Zeb" Orrelios':
           display_name: """“Zeb” Orrelios"""
           text: """While you defend, %CRIT% results are neutralized before %HIT% results.%LINEBREAK%<strong>Locked and Loaded:</strong> While you are docked, after your carrier ship performs a primary %FRONTARC% or %TURRET% attack, it may perform a bonus primary %REARARC% attack."""
        '"Zeb" Orrelios (Sheathipede)':
           display_name: """“Zeb” Orrelios"""
           text: """While you defend, %CRIT% results are neutralized before %HIT% results.%LINEBREAK%<strong>Comms Shuttle:</strong> While you are docked, your carrier ship gains %COORDINATE%. Before your carrier ship activates, it may perform a %COORDINATE% action."""
        '"Zeb" Orrelios (TIE Fighter)':
           display_name: """“Zeb” Orrelios"""
           text: """While you defend, %CRIT% results are neutralized before %HIT% results."""
        "Bombardment Drone":
           text: """If you would drop a device, you may launch that device instead, using the same template. %LINEBREAK% NETWORKED CALCULATIONS: While you defend or perform an attack, you may spend 1 calculate token from a friendly ship at range 0-1 to change 1 %FOCUS% result to an %EVADE% or %HIT% result."""
        "Haor Chall Prototype":
           display_name: """Haor Chall Prototype"""
           text: """After an enemy ship in your %BULLSEYEARC% at range&nbsp;0-2 declares another friendly ship as the defender, you may perform a %CALCULATE% or %LOCK% action.%LINEBREAK%<strong>Networked Calculations:</strong> While you defend or perform an attack, you may spend 1 calculate token from a friendly ship at range&nbsp;0-1 to change 1&nbsp;%FOCUS% result to an %EVADE% or %HIT% result."""
        "Precise Hunter":
           display_name: """Precise Hunter"""
           text: """While you perform an attack, if the defender is in your %BULLSEYEARC%, you may reroll 1&nbsp;blank result.%LINEBREAK%<strong>Networked Calculations:</strong> While you defend or perform an attack, you may spend 1 calculate token from a friendly ship at range&nbsp;0-1 to change 1&nbsp;%FOCUS% result to an %EVADE% or %HIT% result."""
        "Rose Tico":
           display_name: """Rose Tico"""
           text: """While you defend or perform an attack, you may reroll up to 1 of your results for each other friendly ship in the attack arc."""
        "Pammich Nerro Goode":
           display_name: """Pammich Nerro Goode"""
           text: """While you have 2 or fewer stress tokens, you may execute red maneuvers even while stressed."""
        "Padmé Amidala":
           display_name: """Padmé Amidala"""
           text: """While an enemy ship in your %FRONTARC% defends or performs an attack, that ship can modify only 1 %FOCUS% result (other results can still be modified). %LINEBREAK%<strong>Full Throttle:</strong> After you fully execute a speed 3-5 maneuver, you may perform an %EVADE% action."""
        "Anakin Skywalker (N-1 Starfighter)":
           display_name: """Anakin Skywalker"""
           text: """Before you reveal your maneuver, you may spend 1 %FORCE% to barrel roll (this is not an action). %LINEBREAK%<strong>Full Throttle:</strong> After you fully execute a speed 3-5 maneuver, you may perform an %EVADE% action."""
        "Ric Olié":
           display_name: """Ric Olié"""
           text: """While you defend or perform a primary attack, if the speed of your revealed maneuver is higher than the enemy ship's, roll 1 additional die. %LINEBREAK%<strong>Full Throttle:</strong> After you fully execute a speed 3-5 maneuver, you may perform an %EVADE% action."""
        "Dineé Ellberger":
           display_name: """Dineé Ellberger"""
           text: """While you defend or perform an attack, if the speed of your revealed maneuver is the same as the enemy ship's, that ship's dice cannot be modified. %LINEBREAK%<strong>Full Throttle:</strong> After you fully execute a speed 3-5 maneuver, you may perform an %EVADE% action."""
        "Naboo Handmaiden":
           display_name: """Naboo Handmaiden"""
           text: """<strong>Setup:</strong> After placing forces, assign the <strong>Decoyed</strong> condition to 1 friendly ship other than <strong>Naboo Handmaiden</strong>. %LINEBREAK%<strong>Full Throttle:</strong> After you fully execute a speed 3-5 maneuver, you may perform an %EVADE% action."""
        "Bravo Flight Officer":
           display_name: """Bravo Flight Officer"""
           text: """<strong>Full Throttle:</strong> After you fully execute a speed 3-5 maneuver, you may perform an %EVADE% action."""
        "BB-8":
           display_name: """BB-8"""
           text: """During the System Phase, you may perform a red %BARRELROLL% or %BOOST% action."""
        "Finn":
           display_name: """Finn"""
           text: """While you defend or perform an attack, you may add 1 blank result, or you may gain 1 strain token to add 1 focus result instead."""
        "Cova Nell":
           display_name: """Cova Nell"""
           text: """While you defend or perform a primary attack, if your revealed maneuver is red, roll 1 additional die."""
        "Nodin Chavdri":
           display_name: """Nodin Chavdri"""
           text: """After you coordinate or are coordinated, if you have 2 or fewer stress tokens, you may perform 1 action on your action bar as a red action, even if you are stressed."""
        "Vi Moradi":
           display_name: """Vi Moradi"""
           text: """<strong>Setup:</strong> After placing forces, assign the <strong>Compromising Intel</strong> condition to 1 enemy ship."""
        "Shadow Squadron Veteran":
           text: """<strong>Plated Hull:</strong> While you defend, if you are not critically damaged, change 1 %CRIT% to a %HIT% result."""
        "Red Squadron Bomber":
           text: """<strong>Plated Hull:</strong> While you defend, if you are not critically damaged, change 1 %CRIT% to a %HIT% result."""
        '"Goji"':
           text: """While a friendly ship at range 0-3 defends, it may roll 1 additional defense die for each friendly bomb at 0-1 of it. %LINEBREAK%<strong>Plated Hull:</strong> While you defend, if you are not critically damaged, change 1 %CRIT% to a %HIT% result. %LINEBREAK% <i>Errata (since rules reference 1.1.0): Removed "or mine"</i>"""
        '"Broadside"':
           text: """While you perform a %SINGLETURRETARC% attack, if your %SINGLETURRETARC% indicator is in your %LEFTARC% or %RIGHTARC%, you may change 1 blank result to a %FOCUS% result. %LINEBREAK%<strong>Plated Hull:</strong> While you defend, if you are not critically damaged, change 1 %CRIT% to a %HIT% result."""
        '"Matchstick"':
           text: """While you perform a primary or %SINGLETURRETARC% attack, you may reroll 1 attack die for each red token you have. %LINEBREAK%<strong>Plated Hull:</strong> While you defend, if you are not critically damaged, change 1 %CRIT% to a %HIT% result."""
        '"Odd Ball" (Y-Wing)':
           text: """After you execute a red maneuver or perform a red action, if there is an enemy ship in your %BULLSEYEARC%, you may acquire a lock on that ship. %LINEBREAK%<strong>Plated Hull:</strong> While you defend, if you are not critically damaged, change 1 %CRIT% to a %HIT% result."""
        "R2-D2":
           text: """At the start of the Engagement Phase, if there is an enemy ship in your %REARARC%, gain 1 calculate token.%LINEBREAK%<strong>Plated Hull:</strong> While you defend, if you are not critically damaged, change 1 %CRIT% to a %HIT% result."""
        "Anakin Skywalker (Y-Wing)":
           text: """After you fully execute a maneuver, if there is an enemy ship in your %FRONTARC% at range 0-1 or in your %BULLSEYEARC%, you may spend 1 %FORCE% to remove 1 stress token.%LINEBREAK%<strong>Plated Hull:</strong> While you defend, if you are not critically damaged, change 1 %CRIT% to a %HIT% result."""
        "Sun Fac":
           text: """While you perform a primary attack, if the defender is tractored, roll 1 additional attack die. %LINEBREAK% <strong>Pinpoint Tractor Array:</strong> You cannot rotate your %SINGLETURRETARC% to your %REARARC%. After you execute a maneuver, you may gain 1 tractor token to perform a %ROTATEARC% action."""
        "Stalgasin Hive Guard":
           text: """<strong>Pinpoint Tractor Array:</strong> You cannot rotate your %SINGLETURRETARC% to your %REARARC%. After you execute a maneuver, you may gain 1 tractor token to perform a %ROTATEARC% action."""
        "Petranaki Arena Ace":
           text: """<strong>Pinpoint Tractor Array:</strong> You cannot rotate your %SINGLETURRETARC% to your %REARARC%. After you execute a maneuver, you may gain 1 tractor token to perform a %ROTATEARC% action."""
        "Berwer Kret":
           text: """After you perform an attack that hits, each friendly ship with %CALCULATE% on its action bar and a lock on the defender may perform a red %CALCULATE% action. %LINEBREAK%<strong>Pinpoint Tractor Array:</strong> You cannot rotate your %SINGLETURRETARC% to your %REARARC%. After you execute a maneuver, you may gain 1 tractor token to perform a %ROTATEARC% action."""
        "Chertek":
           text: """While you perform a primary attack, if the defender is tractored, you may reroll up to 2 attack dice. %LINEBREAK%<strong>Pinpoint Tractor Array:</strong> You cannot rotate your %SINGLETURRETARC% to your %REARARC%. After you execute a maneuver, you may gain 1 tractor token to perform a %ROTATEARC% action."""
        "Gorgol":
           text: """During the System Phase, you may gain 1 disarm token and choose a friendly ship at range 1-2. If you do, it gains 1 tractor token, then repairs 1 of its faceup <strong>Ship</strong> trait damage cards. %LINEBREAK%<strong>Pinpoint Tractor Array:</strong> You cannot rotate your %SINGLETURRETARC% to your %REARARC%. After you execute a maneuver, you may gain 1 tractor token to perform a %ROTATEARC% action."""
        "Kazuda Xiono":
           text: """While you defend or perform a primary attack, if the enemy ship's initiative is higher than the number of damage cards you have, you may roll 1 additional die. %LINEBREAK%<strong>Explosion with Wings:</strong> You are dealt 1 facedown damage card. After you perform a %SLAM% action, you may expose 1 damage card to remove 1 disarm token."""
        "Major Vonreg":
           text: """During the System Phase, you may choose 1 enemy ship in your %BULLSEYEARC%. That ship gains 1 deplete or strain token of your choice. %LINEBREAK%<strong>Fine-Tuned Thrusters:</strong> After you fully execute a maneuver, if you are not depleted or strained, you may gain 1 deplete or strain token to perform a %LOCK% or %BARRELROLL% action."""
        "First Order Provocateur":
           text: """<strong>Fine-Tuned Thrusters:</strong> After you fully execute a maneuver, if you are not depleted or strained, you may gain 1 deplete or strain token to perform a %LOCK% or %BARRELROLL% action."""
        '"Ember"':
           text: """While you perform an attack, if there is a damaged ship friendly to the defender at range 0-1 of the defender, the defender cannot spend focus or calculate tokens. %LINEBREAK%<strong>Fine-Tuned Thrusters:</strong> After you fully execute a maneuver, if you are not depleted or strained, you may gain 1 deplete or strain token to perform a %LOCK% or %BARRELROLL% action."""
        '"Holo"':
           text: """At the start of the Engagement Phase, you <b>must</b> transfer 1 of your tokens to another friendly ship at range 0-2. %LINEBREAK%<strong>Fine-Tuned Thrusters:</strong> After you fully execute a maneuver, if you are not depleted or strained, you may gain 1 deplete or strain token to perform a %LOCK% or %BARRELROLL% action."""
        "Captain Phasma":
           text: """While you defend, after the Neutralize Results step, another friendly ship at range 0-1 <b>must</b> suffer 1 %HIT%/%CRIT% damage to cancel 1 matching result. %LINEBREAK%<strong>Heavy Weapon Turret:</strong> You can rotate your %SINGLETURRETARC% indicator only to your %FRONTARC% or %REARARC%. You <b>must</b> treat the %FRONTARC% requirement of your equipped %MISSILE% upgrades as %SINGLETURRETARC%."""
        '"Rush"':
           text: """While you are damaged, treat your initiative as 6. %LINEBREAK%<strong>Autothrusters:</strong> After you perform an action, you may perform a red %BARRELROLL% or red %BOOST% action."""
        "Zizi Tlo":
           text: """After you defend or perform an attack, you may spend 1 %CHARGE% to gain 1 focus or evade token. %LINEBREAK%<strong>Refined Gyrostabilizers:</strong> You can rotate your %SINGLETURRETARC% indicator only to your %FRONTARC% or %REARARC%. After you perform an action, you may perform a red %BOOST% or red %ROTATEARC% action."""
        "Ronith Blario":
           text: """While you defend or perform an attack, if the enemy ship is in another friendly ship's %SINGLETURRETARC%, you may spend 1 focus token from that friendly ship to change 1 of your %FOCUS% results to an %EVADE% or %HIT% result. %LINEBREAK%<strong>Refined Gyrostabilizers:</strong> You can rotate your %SINGLETURRETARC% indicator only to your %FRONTARC% or %REARARC%. After you perform an action, you may perform a red %BOOST% or red %ROTATEARC% action."""
        "Gina Moonsong":
           text: """At the start of the Engagement Phase, you <b>must</b> transfer 1 of your stress tokens to another friendly ship at range 0-2."""
        "K-2SO":
           text: """After you gain a stress token, gain 1 calculate token."""
        "Alexsandr Kallus":
           text: """While you defend, if the attacker modified any attack dice, you may roll 1 additional defense die."""
        "Leia Organa":
           text: """After a friendly ship fully executes a red maneuver, if it is at range 0-3, you may spend 1 %FORCE%. If you do, that ship gains 1 focus token or recovers 1 %FORCE%."""
        "Paige Tico":
           text: """After you drop a device, you may spend 1 %CHARGE% to drop an additional device."""
        "Fifth Brother":
           text: """While you perform an attack, after the Neutralize Results step, if the attack hit, you may spend 2 %FORCE% to add 1 %CRIT% result."""
        '"Vagabond"':
           text: """After you fully execute a maneuver using your <strong>Adaptive Ailerons</strong>, if you are not stressed you may drop 1 device. %LINEBREAK%<strong>Adaptive Ailerons:</strong> Before you reveal your dial, if you are not stressed, you <b>must</b> execute a white [1&nbsp;%BANKLEFT%], [1&nbsp;%STRAIGHT%], or [1&nbsp;%BANKRIGHT%] maneuver."""
        "Morna Kee":
           text: """During the End Phase, you may spend 1 %CHARGE% to flip 1 of your reinforce tokens to the other full arc instead of removing it."""
        "Lieutenant LeHuse":
           text: """While you perform an attack, you may spend another friendly ship's lock on the defender to reroll any number of your results. %LINEBREAK%<strong>Heavy Weapon Turret:</strong> You can rotate your %SINGLETURRETARC% indicator only to your %FRONTARC% or %REARARC%. You <b>must</b> treat the %FRONTARC% requirement of your equipped %MISSILE% upgrades as %SINGLETURRETARC%."""
        "Bossk (Z-95 Headhunter)":
           display_name: """Bossk"""
           text: """While you perform a primary attack, after the Neutralize Results step, you may spend 1 %CRIT% result to add 2 %HIT% results. %LINEBREAK%<strong>Pursuit Craft:</strong> After you deploy, you may acquire a lock on a ship the friendly <strong>Hound's Tooth</strong> has locked."""
        "G4R-GOR V/M":
           text: """After you defend, each other ship at range 0 suffers 1 %CRIT% damage. %LINEBREAK%<strong>Weapon Hardpoint:</strong> You can equip 1&nbsp;%CANNON%, %TORPEDO%, or %MISSILE% upgrade."""
        "Nom Lumb":
           text: """After you become the defender, if the attacker is not in your %SINGLETURRETARC%, you <b>must</b> rotate your %SINGLETURRETARC% indicator to a standard arc the attacker is in."""
        "Jarek Yeager":
           text: """While you have 2 or fewer stress tokens, if you are damaged, you can execute red basic maneuvers even while stressed. If you are critically damaged, you can execute red advanced maneuvers even while stressed. %LINEBREAK%<strong>Explosion with Wings:</strong> You are dealt 1 facedown damage card. After you perform a %SLAM% action, you may expose 1 damage card to remove 1 disarm token."""
        "R1-J5":
           text: """Before you expose 1 of your damage cards, you may look at your facedown damage cards, choose 1 and expose that card instead. %LINEBREAK%<strong>Explosion with Wings:</strong> You are dealt 1 facedown damage card. After you perform a %SLAM% action, you may expose 1 damage card to remove 1 disarm token."""
        "Colossus Station Mechanic":
           text: """<strong>Explosion with Wings:</strong> You are dealt 1 facedown damage card. After you perform a %SLAM% action, you may expose 1 damage card to remove 1 disarm token."""
        "212th Battalion Pilot":
           text: """<strong>Fire Ordinance:</strong> While a friendly ship performs a non-%SINGLETURRETARC% attack, if the defender is in your turret arc you may spend 1 charge token, if you do the attacker may reroll up to 2 results."""
        "Hawk":
           text: """At the start of the end phase if a friendly ship at range 0-1 has a revealed maneuver higher than this one it may gain 1 strain token to perform a boost action. %LINEBREAK%<strong>Fire Ordinance:</strong> While a friendly ship performs a non-%SINGLETURRETARC% attack, if the defender is in your turret arc you may spend 1 charge token, if you do the attacker may reroll up to 2 results."""
        "Separatist Predator":
           text: """After you barrel roll or maneuver you are stressed. Gain 1 calculate token. %LINEBREAK%<strong>Networked Aim:</strong> You cannot spend your locks to reroll attack dice. While you perform an attack, you may reroll a number of attack dice up to the number of friendly locks on the defender."""
        '"Rampage"':
           text: """After you execute a speed 3-4 maneuver, you may choose a ship in your %SINGLETURRETARC% at range 0-1. If you do, that ship gains 1 strain token, or 2 strain tokens if you are damaged. %LINEBREAK% <strong>Rotating Cannons:</strong> You can rotate your %SINGLETURRETARC% indicator only to your %FRONTARC% or %BACKARC%. You must treat the %FRONTARC% requirement of your equipped %CANNON% upgrades as %SINGLETURRETARC%."""

        # Epic Ships
        "Republic Judiciary":
           display_name: """Republic Judiciary"""
           text: """<i class = flavor_text>The Galactic Republic uses small, swift warships such as the CR90 corvette to respond rapidly to Separatist incursions across the galaxy.</i> %LINEBREAK% <strong>Broadside Batteries:</strong> You can acquire locks and perform primary attacks at range 1-4."""
        "Alderaanian Guard":
           display_name: """Alderaanian Guard"""
           text: """<i class = flavor_text>A craft used since before the Clone Wars, the CR90 corvette is favored by the Royal House of Alderaan for its versatility.</i> %LINEBREAK% <strong>Broadside Batteries:</strong> You can acquire locks and perform primary attacks at range 1-4."""
        "Outer Rim Patrol":
           display_name: """Outer Rim Patrol"""
           text: """<i class = flavor_text>The <untalic>Raider</untalic>-class corvette is one of the Empire's smallest warships, often used for reconnaissance missions, surgical strikes, or suppressing enemy starfighters with its powerful ordnance.</i> %LINEBREAK% <strong>Concentrated Batteries:</strong> While you perform a primary, %TORPEDO%, or %MISSILE% attack, if the defender is in your %BULLSEYEARC%, roll 1 additional die."""
        "First Order Collaborators":
           display_name: """First Order Collaborators"""
           text: """<i class = flavor_text>The First Order's supporters make use of former Imperial vessels, such as the <untalic>Raider</untalic>-class corvette. Though it has outlived the regime that created it, this craft still spreads terror across the galaxy.</i> %LINEBREAK% <strong>Concentrated Batteries:</strong> While you perform a primary, %TORPEDO%, or %MISSILE% attack, if the defender is in your %BULLSEYEARC%, roll 1 additional die."""
        "Echo Base Evacuees":
           display_name: """Echo Base Evacuees"""
           text: """<i class = flavor_text>The GR-75 medium transport acquitted itself well at battles such as the evacuation of Hoth, where several of these ships were pivotal to the Rebel forces' escape.</i> %LINEBREAK% <strong>Resupply Craft:</strong> After another friendly ship at range 0-1 performs an action, you may spend 1 %ENERGY%. If you do, it removes 1 orange or red token, or recovers 1 shield."""
        "New Republic Volunteers":
           display_name: """New Republic Volunteers"""
           text: """<i class = flavor_text>In use since the Galactic Civil War, groups within the New Republic still utilize the GR-75 medium transport for supply and aid missions.</i> %LINEBREAK% <strong>Resupply Craft:</strong> After another friendly ship at range 0-1 performs an action, you may spend 1 %ENERGY%. If you do, it removes 1 orange or red token, or recovers 1 shield."""
        "Outer Rim Garrison":
           display_name: """Outer Rim Garrison"""
           text: """<i class = flavor_text>Capable of carrying TIE fighters and operating independently for long periods of time, the <untalic>Gozanti</untalic>-class cruiser is a common sight in the skies of downtrodden worlds across the Outer Rim.</i> %LINEBREAK% <strong>Docking Clamps:</strong> You can dock up to 4 small ships."""
        "First Order Sympathizers":
           display_name: """First Order Sympathizers"""
           text: """<i class = flavor_text>The First Order's swift rise to power rests upon ruthless innovation. However, sympathizers often repurpose Imperial designs, like the venerable <untalic>Gozanti</untalic>-class cruiser, in surveillance and patrol operations.</i> %LINEBREAK% <strong>Docking Clamps:</strong> You can dock up to 4 small ships."""
        "Separatist Privateers":
           display_name: """Separatist Privateers"""
           text: """<i class = flavor_text>The Separatist Alliance makes use of all manner of unsavory contacts in its fight against the Galactic Republic, including corsairs and criminal cartels.</i> %LINEBREAK% <strong>Overdrive Burners:</strong> While you defend, if your revealed maneuver is speed 3-5, roll 1 additional defense die."""
        "Syndicate Smugglers":
           display_name: """Syndicate Smugglers"""
           text: """<i class = flavor_text>Vessels like the C-ROC Cruiser allow criminal operations across the Outer Rim to move massive amounts of illicit materials, or project power that can bully small colonies into compliance.</i> %LINEBREAK% <strong>Overdrive Burners:</strong> While you defend, if your revealed maneuver is speed 3-5, roll 1 additional defense die."""
            
            

    upgrade_translations =
        "0-0-0":
           display_name: """0-0-0"""
           text: """<i>Scum or Squad including Darth Vader only</i>%LINEBREAK%At the start of the Engagement Phase, you may choose 1 enemy ship at range 0-1. If you do, you gain 1 calculate token unless that ship chooses to gain 1 stress token."""
        "4-LOM":
           display_name: """4-LOM"""
           text: """<i>Scum only</i>%LINEBREAK%While you perform an attack, after rolling attack dice, you may name a type of green token. If you do, gain 2 ion tokens and, during this attack, the defender cannot spend tokens of the named type."""
        "Andrasta":
           display_name: """Andrasta"""
           text: """<i>Adds %RELOAD%</i>%LINEBREAK%<i>Scum only</i>%LINEBREAK%Adds %DEVICE% slot."""
        "Black One":
           display_name: """Black One"""
           text: """<i>Adds %SLAM%</i>%LINEBREAK%<i>Resistance only</i>%LINEBREAK%After you perform a %SLAM% action, lose 1&nbsp;%CHARGE%. Then you may gain 1 ion token to remove 1 disarm token.%LINEBREAK%If your %CHARGE% is inactive, you cannot perform the %SLAM% action."""
        "Dauntless":
           display_name: """Dauntless"""
           text: """<i>Empire only</i>%LINEBREAK%After you partially execute a maneuver, you may perform 1 white action, treating that action as red."""
        "Ghost":
           display_name: """Ghost"""
           text: """<i>Rebel only</i>%LINEBREAK%You can dock 1 attack shuttle or Sheathipede-class shuttle.%LINEBREAK%Your docked ships can deploy only from your rear guides."""
        "Havoc":
           display_name: """Havoc"""
           text: """<i>Scum only</i>%LINEBREAK%Remove %CREW% slot. Adds %SENSOR% and %ASTROMECH% slots."""
        "Hound's Tooth":
           display_name: """Hound’s Tooth"""
           text: """<i>Scum only</i>%LINEBREAK%1 Z-95-AF4 headhunter can dock with you."""
        "IG-2000":
           display_name: """IG-2000"""
           text: """<i>Scum only</i>%LINEBREAK%You have the pilot ability of each other friendly ship with the <strong>IG-2000</strong> upgrade."""
        "Marauder":
           display_name: """Marauder"""
           text: """<i>Scum only</i>%LINEBREAK%While you perform a primary %REARARC% attack, you may reroll 1 attack die.%LINEBREAK%Adds %GUNNER% slot."""
        "Millennium Falcon":
           display_name: """Millennium Falcon"""
           text: """<i>Adds %EVADE%</i>%LINEBREAK%<i>Rebel only</i>%LINEBREAK%While you defend, if you are evading, you may reroll 1 defense die."""
        "Mist Hunter":
           display_name: """Mist Hunter"""
           text: """<i>Adds %BARRELROLL%</i>%LINEBREAK%<i>Scum only</i>%LINEBREAK%Adds %CANNON% slot."""
        "Moldy Crow":
           display_name: """Moldy Crow"""
           text: """<i>Rebel or Scum only</i>%LINEBREAK%Gain a %FRONTARC% primary weapon with a value of “3.”%LINEBREAK%During the End Phase, do not remove up to 2 focus tokens."""
        "Outrider":
           display_name: """Outrider"""
           text: """<i>Rebel only</i>%LINEBREAK% While you perform an attack that is obstructed by an obstacle, the defender rolls 1 fewer defense die. %LINEBREAK% After you fully execute a maneuver, if you moved through or overlapped an obstacle, you may remove 1 of your red or orange tokens. %LINEBREAK% <i>Errata (since rules reference 1.0.2): changed "obstructed attack" to "an attack that is obstructed by an obstacle"</i>"""
        "Phantom":
           display_name: """Phantom"""
           text: """<i>Rebel only</i>%LINEBREAK%You can dock at range 0-1."""
        "Punishing One":
           display_name: """Punishing One"""
           text: """<i>Scum only</i>%LINEBREAK%While you perform a primary attack, if the defender is in your %FRONTARC%, roll 1 additional attack die.%LINEBREAK%Remove %CREW% slot. Adds %ASTROMECH% slot."""
        "ST-321":
           display_name: """ST-321"""
           text: """<i>Empire only</i>%LINEBREAK%After you perform a %COORDINATE% action, you may choose an enemy ship at range 0-3 of the ship you coordinated. If you do, acquire a lock on that enemy ship, ignoring range restrictions."""
        "Scimitar":
           display_name: """Scimitar"""
           text: """<i>Adds <r>%CLOAK%</r> ,  %JAM%</i>%LINEBREAK%<i>Separatist Alliance only</i>%LINEBREAK%<strong>Setup:</strong> After the Place Forces step, you may cloak.%LINEBREAK%After you decloak, you may choose an enemy ship in your %BULLSEYEARC%. If you do, it gains 1&nbsp;jam token."""
        "Shadow Caster":
           display_name: """Shadow Caster"""
           text: """<i>Scum only</i>%LINEBREAK%After you perform an attack that hits, if the defender is in your %SINGLETURRETARC% and your %FRONTARC%, the defender gains 1 tractor token."""
        "Slave I":
           display_name: """Slave I"""
           text: """<i>Scum only</i>%LINEBREAK%After you reveal a turn (%TURNLEFT% or %TURNRIGHT%) or bank (%BANKLEFT% or %BANKRIGHT%) maneuver you may set your dial to the maneuver of the same speed and bearing in the other direction.%LINEBREAK%Adds %TORPEDO% slot.%LINEBREAK%<i>Errata (since rules reference 1.0.2): removed "you may gain 1 stress token. If you do,"</i>"""
        "Virago":
           display_name: """Virago"""
           text: """<i>Adds 1 shield</i> %LINEBREAK% During the End Phase, you may spend 1&nbsp;%CHARGE% to perform a red %BOOST% action.%LINEBREAK%Adds %MODIFICATION% slot."""
        "Soulless One":
           display_name: """Soulless One"""
           text: """<i>Separatist Alliance only %LINEBREAK% Adds 2 Hull</i>%LINEBREAK% While you defend, if the attacker is outside your firing arc, you may reroll 1&nbsp;defense die."""
        "Ablative Plating":
           display_name: """Ablative Plating"""
           text: """<i>large ship or medium ship only</i>%LINEBREAK%Before you would suffer damage from an obstacle or from a friendly bomb detonating, you may spend 1&nbsp;%CHARGE%. If you do, prevent 1 damage."""
        "Admiral Sloane":
           display_name: """Admiral Sloane"""
           text: """<i>Empire only</i>%LINEBREAK%After another friendly ship at range 0-3 defends, if it is destroyed, the attacker gains 2 stress tokens.%LINEBREAK%While a friendly ship at range 0-3 performs an attack against a stressed ship, it may reroll 1 attack die."""
        "Adv. Proton Torpedoes":
           display_name: """Adv. Proton Torpedoes"""
           text: """<strong>Attack (%LOCK%):</strong> Spend 1&nbsp;%CHARGE%. Change 1&nbsp;%HIT% result to a %CRIT% result."""
        "Advanced Optics":
           display_name: """Advanced Optics"""
           text: """While you perform an attack, you may spend 1 focus token to change 1 of your blank results to a %HIT% result."""
        "Advanced SLAM":
           display_name: """Advanced SLAM"""
           text: """<i>Requires %SLAM%</i>%LINEBREAK%After you perform a %SLAM% action, if you fully executed the maneuver, you may perform a white action on your action bar, treating that action as red."""
        "Advanced Sensors":
           display_name: """Advanced Sensors"""
           text: """After you reveal your dial, you may perform 1 action.%LINEBREAK%If you do, you cannot perform another action during your activation."""
        "Afterburners":
           display_name: """Afterburners"""
           text: """<i>small ship only</i>%LINEBREAK%After you fully execute a speed 3-5 maneuver, you may spend 1&nbsp;%CHARGE% to perform a %BOOST% action, even while stressed."""
        "Agent Kallus":
           display_name: """Agent Kallus"""
           text: """<i>Empire only</i>%LINEBREAK%<strong>Setup:</strong> After placing forces, assign the <strong>Hunted</strong> condition to 1 enemy ship.%LINEBREAK%While you perform an attack against the ship with the <strong>Hunted</strong> condition, you may change 1 of your %FOCUS% results to a %HIT% result.%LINEBREAK%<i>Errata (since rules reference 1.1.0)</i>:"Added After placing forces,"</i>"""
        "Agile Gunner":
           display_name: """Agile Gunner"""
           text: """During the End Phase, you may rotate your %SINGLETURRETARC% indicator."""
        "Autoblasters":
           text: """<strong>Attack:</strong>If the defender is in your %BULLSEYEARC%, roll 1 additional die. During the Neutralize Results step, if you are not in the defenders %FRONTARC%, %EVADE% results do not cancel %CRIT% results."""
        "BB Astromech":
           display_name: """BB Astromech"""
           text: """<i>Resistance only</i>%LINEBREAK%Before you execute a blue maneuver, you may spend 1&nbsp;%CHARGE% to perform a %BARRELROLL% action."""
        "BB-8":
           display_name: """BB-8"""
           text: """<i>Resistance only</i>%LINEBREAK%Before you execute a blue maneuver, you may spend 1&nbsp;%CHARGE% to perform a&nbsp;%BARRELROLL% or&nbsp;%BOOST% action."""
        "BT-1":
           display_name: """BT-1"""
           text: """<i>Scum or Squad including Darth Vader only</i>%LINEBREAK%While you perform an attack, you may change 1&nbsp;%HIT% result to a %CRIT% result for each stress token the defender has."""
        "Barrage Rockets":
           display_name: """Barrage Rockets"""
           text: """<strong>Attack (%FOCUS%):</strong> Spend 1&nbsp;%CHARGE%. If the defender is in your %BULLSEYEARC%, you may spend 1 or more %CHARGE% to reroll that many attack dice."""
        "Battle Meditation":
           display_name: """Battle Meditation"""
           text: """<i>Adds %F-COORDINATE%</i>%LINEBREAK%<i>Galactic Republic only</i>%LINEBREAK%You cannot coordinate limited ships.%LINEBREAK% While you perform a purple %COORDINATE% action, you may coordinate 1 additional friendly non-limited ship of the same type. Both ships must perform the same action."""
        "Baze Malbus":
           display_name: """Baze Malbus"""
           text: """<i>Rebel only</i>%LINEBREAK%While you perform a %FOCUS% action, you may treat it as red. If you do, gain 1 additional focus token for each enemy ship at range 0-1, to a maximum of 2."""
        "Biohexacrypt Codes":
           display_name: """Biohexacrypt Codes"""
           text: """<i>Requires %LOCK% or <r>%LOCK%</r></i>%LINEBREAK%<i>First Order only</i>%LINEBREAK%While you coordinate or jam, if you have a lock on a ship, you may spend that lock to choose that ship, ignoring range restrictions."""
        "Bistan":
           display_name: """Bistan"""
           text: """<i>Rebel only</i>%LINEBREAK%After you perform a primary attack, if you are focused, you may perform a bonus %SINGLETURRETARC% attack against a ship you have not already attacked this round."""
        "Boba Fett":
           display_name: """Boba Fett"""
           text: """<i>Scum only</i>%LINEBREAK%<strong>Setup:</strong> Start in reserve.%LINEBREAK%At the end of Setup, place yourself at range 0 of an obstacle and beyond range 3 of any enemy ship."""
        "Bomblet Generator":
           display_name: """Bomblet Generator"""
           text: """<strong>Bomb</strong>%LINEBREAK%During the System Phase, you may spend 1&nbsp;%CHARGE% to drop a Bomblet with the [1&nbsp;%STRAIGHT%] template.%LINEBREAK%At the start of the Activation Phase, you may spend 1 shield to recover 2 %CHARGE%."""
        "Bossk":
           display_name: """Bossk"""
           text: """<i>Scum only</i>%LINEBREAK%After you perform a primary attack that misses, if you are not stressed, you <b>must</b> receive 1 stress token to perform a bonus primary attack against the same target."""
        "Brilliant Evasion":
           display_name: """Brilliant Evasion"""
           text: """While you defend, if you are not in the attacker's %BULLSEYEARC%, you may spend 1 %FORCE% to change 2 of your %FOCUS% results to %EVADE%&nbsp;results."""
        "C-3PO":
           display_name: """C-3PO"""
           text: """<i>Adds %CALCULATE%</i>%LINEBREAK%<i>Rebel only</i>%LINEBREAK%Before rolling defense dice, you may spend 1 calculate token to guess aloud a number 1 or higher. If you do and you roll exactly that many %EVADE% results, add 1&nbsp;%EVADE% result.%LINEBREAK%After you perform the %CALCULATE% action, gain 1 calculate token."""
        "C-3PO (Resistance)":
           display_name: """C-3PO"""
           text: """<i>Adds %CALCULATE% ,  <r>%COORDINATE%</r></i>%LINEBREAK%<i>Resistance only</i>%LINEBREAK%While you coordinate, you can choose friendly ships beyond range 2 if they have&nbsp;%CALCULATE% on their action bar.%LINEBREAK%After you perform the&nbsp;%CALCULATE% or&nbsp;%COORDINATE% action, gain 1&nbsp;calculate token."""
        "Cad Bane":
           display_name: """Cad Bane"""
           text: """<i>Scum only</i>%LINEBREAK%After you drop or launch a device, you may perform a red %BOOST% action."""
        "Calibrated Laser Targeting":
           display_name: """Calibrated Laser Targeting"""
           text: """While you perform a primary attack, if&nbsp;the defender is in your %BULLSEYEARC%, add 1&nbsp;%FOCUS%&nbsp;result."""
        "Captain Phasma":
           display_name: """Captain Phasma"""
           text: """<i>First Order only</i>%LINEBREAK%At the end of the Engagement Phase, each enemy ship at range 0-1 that is not stressed gains 1 stress token."""
        "Cassian Andor":
           display_name: """Cassian Andor"""
           text: """<i>Rebel only</i>%LINEBREAK%During the System Phase, you may choose 1 enemy ship at range 1-2 and guess aloud a bearing and speed, then look at that ship’s dial. If the chosen ship’s bearing and speed match your guess, you may set your dial to another maneuver."""
        "Chancellor Palpatine":
           display_name: """Chancellor Palpatine"""
           text: """<i>Separatist Alliance or Galactic Republic only</i>%LINEBREAK%<i>Adds <f>%COORDINATE%</f></i>%LINEBREAK%Chancellor Palpatine:%LINEBREAK%<strong>Setup:</strong> Equip this side faceup.%LINEBREAK%After you defend, if the attacker is at range 0-2, you may spend 1 %FORCE%. If you do, the attacker gains 1 stress token.%LINEBREAK%During the End Phase, you may flip this card.%LINEBREAK%Darth Sidious%LINEBREAK%After you perform a purple&nbsp;%COORDINATE%&nbsp;action, the ship you coordinated gains 1&nbsp;stress token. Then, it gains 1&nbsp;focus token or recovers 1&nbsp;%FORCE%."""
        "Chewbacca":
           display_name: """Chewbacca"""
           text: """<i>Rebel only</i>%LINEBREAK%At the start of the Engagement Phase, you may spend 2 %CHARGE% to repair 1 faceup damage card."""
        "Chewbacca (Scum)":
           display_name: """Chewbacca"""
           text: """<i>Scum only</i>%LINEBREAK%At the start of the End Phase, you may spend 1 focus token to repair 1 of your faceup damage cards."""
        "Chewbacca (Resistance)":
           display_name: """Chewbacca"""
           text: """<i>Resistance only</i>%LINEBREAK%<strong>Setup:</strong> Lose 1&nbsp;%CHARGE%.%LINEBREAK%After a friendly ship at range&nbsp;0-3 is dealt 1&nbsp;damage card, recover 1&nbsp;%CHARGE%.%LINEBREAK%While you perform an attack, you may spend 2&nbsp;%CHARGE% to change 1&nbsp;%FOCUS% result to a&nbsp;%CRIT% result."""
        "Ciena Ree":
           display_name: """Ciena Ree"""
           text: """<i>Requires %COORDINATE% or <r>%COORDINATE%</r></i>%LINEBREAK%<i>Empire only</i>%LINEBREAK%After you perform a %COORDINATE% action, if the ship you coordinated performed a %BARRELROLL% or %BOOST% action, it may gain 1 stress token to rotate 90°."""
        "Cikatro Vizago":
           display_name: """Cikatro Vizago"""
           text: """<i>Scum only</i>%LINEBREAK%During the End Phase, you may choose 2 %ILLICIT% upgrades equipped to friendly ships at range 0-1. If you do, you may exchange these upgrades.%LINEBREAK%<strong>End of Game:</strong> Return all %ILLICIT% upgrades to their original ships."""
        "Cloaking Device":
           display_name: """Cloaking Device"""
           text: """<i>small ship or medium ship only</i>%LINEBREAK%<strong>Action:</strong> Spend 1&nbsp;%CHARGE% to perform a %CLOAK% action.%LINEBREAK%At the start of the Planning Phase, roll 1 attack die. On a %FOCUS% result, decloak or discard your cloak token."""
        "Clone Commander Cody":
           display_name: """Clone Commander Cody"""
           text: """<i>Galactic Republic only</i>%LINEBREAK%After you perform an attack that missed, if 1&nbsp;or more %HIT%/%CRIT% results were neutralized, the defender gains 1&nbsp;strain token."""
        "Cluster Missiles":
           display_name: """Cluster Missiles"""
           text: """<strong>Attack (%LOCK%):</strong> Spend 1&nbsp;%CHARGE%. After this attack, you may perform this attack as a bonus attack against a different target at range 0-1 of the defender, ignoring the %LOCK% requirement."""
        "Collision Detector":
           display_name: """Collision Detector"""
           text: """While you boost or barrel roll, you can move through and overlap obstacles.%LINEBREAK%After you move through or overlap an obstacle, you may spend 1&nbsp;%CHARGE% to ignore its effects until the end of the round."""
        "Composure":
           display_name: """Composure"""
           text: """<i>Requires <r>%FOCUS%</r> or %FOCUS%</i>%LINEBREAK%After you fail an action, if you have no green tokens, you may perform a %FOCUS% action. If you do, you cannot perform additional actions this round. %LINEBREAK% <i>Errata (since rules reference 1.1.0): Added "If you do, you cannot perform additional actions this round."</i>"""
        "Concussion Missiles":
           display_name: """Concussion Missiles"""
           text: """<strong>Attack (%LOCK%):</strong> Spend 1&nbsp;%CHARGE%. After this attack hits, each ship at range 0-1 of the defender exposes 1 of its damage cards."""
        "Conner Nets":
           display_name: """Conner Nets"""
           text: """<strong>Mine</strong>%LINEBREAK%During the System Phase, you may spend 1&nbsp;%CHARGE% to drop a Conner Net using the [1&nbsp;%STRAIGHT%] template.%LINEBREAK%This card’s %CHARGE% cannot be recovered."""
        "Contraband Cybernetics":
           display_name: """Contraband Cybernetics"""
           text: """Before you activate, you may spend 1&nbsp;%CHARGE%. If you do, until the end of the round, you can perform actions and execute red maneuvers, even while stressed."""
        "Count Dooku":
           display_name: """Count Dooku"""
           text: """<i>Separatist Alliance only</i>%LINEBREAK%Before a ship at range&nbsp;0-2 rolls attack or defense dice, if all of your %FORCE% are active, you may spend 1 %FORCE% and name a result. If the roll does not contain the named result, the ship must change 1&nbsp;die to that result."""
        "Crack Shot":
           display_name: """Crack Shot"""
           text: """While you perform a primary attack, if the defender is in your %BULLSEYEARC%, before the Neutralize Results step, you may spend 1&nbsp;%CHARGE% to cancel 1&nbsp;%EVADE% result."""
        "DRK-1 Probe Droids":
           display_name: """DRK-1 Probe Droids"""
           text: """<i>Separatist Alliance only</i>%LINEBREAK%During the End Phase, you may spend 1&nbsp;%CHARGE% to drop or launch 1&nbsp;DRK-1 probe droid using a speed 3 template.%LINEBREAK%This card’s %CHARGE% cannot be recovered."""
        "Daredevil":
           display_name: """Daredevil"""
           text: """<i>Requires %BOOST%</i>%LINEBREAK%<i>small ship only</i>%LINEBREAK%While you perform a white %BOOST% action, you may treat it as red to use the [1&nbsp;%TURNLEFT%] or [1&nbsp;%TURNRIGHT%] template instead."""
        "Darth Vader":
           display_name: """Darth Vader"""
           text: """<i>Empire only</i>%LINEBREAK%At the start of the Engagement Phase, you may choose 1 ship in your firing arc at range 0-2 and spend 1&nbsp;%FORCE%. If you do, that ship suffers 1&nbsp;%HIT% damage unless it chooses to remove 1 green token."""
        "Deadman's Switch":
           display_name: """Deadman’s Switch"""
           text: """After you are destroyed, each other ship at range 0-1 suffers 1&nbsp;%HIT% damage."""
        "Death Troopers":
           display_name: """Death Troopers"""
           text: """<i>Empire only</i>%LINEBREAK%During the Activation Phase, enemy ships at range 0-1 cannot remove stress tokens."""
        "Debris Gambit":
           display_name: """Debris Gambit"""
           text: """<i>Adds <r>%EVADE%</r></i>%LINEBREAK%<i>small ship or medium ship only</i>%LINEBREAK%While you perform a red %EVADE% action, if there is an obstacle at range 0-1, treat the action as white instead."""
        "Dedicated":
           display_name: """Dedicated"""
           text: """<i>Galactic Republic only</i>%LINEBREAK%While another friendly ship in your %LEFTARC%&nbsp;or %RIGHTARC% at range&nbsp;0-2 defends, if it is limited or has the <strong>Dedicated</strong> upgrade and you are not strained, you may gain 1 strain token. If you do, the defender rerolls 1&nbsp;of their blank results."""
        "Delayed Fuses":
           display_name: """Delayed Fuses"""
           text: """After you drop, launch or place a bomb or mine, you may place 1 fuse marker on that device."""
        "Delta-7B":
           display_name: """Delta-7B"""
           text: """<i class = flavor_text>The Delta-7B was designed as a heavier variant of the Delta-7 Aethersprite-class Interceptor, identifiable by the repositioned astromech slot. Many Jedi Generals favor this craft’s greater firepower and durability.</i>"""
        "Dengar":
           display_name: """Dengar"""
           text: """<i>Scum only</i>%LINEBREAK%After you defend, if the attacker is in your firing arc, you may spend 1&nbsp;%CHARGE%. If you do, roll 1 attack die unless the attacker chooses to remove 1 green token. On a %HIT% or %CRIT% result, the attacker suffers 1&nbsp;%HIT% damage."""
        "Diamond-Boron Missiles":
           display_name: """Diamond-Boron Missiles"""
           text: """<strong>Attack (%LOCK%):</strong> Spend 1&nbsp;%CHARGE%. After this attack hits, you may spend 1 %CHARGE%. If you do, each ship at range 0-1 of the defender with agility equal to or less than the defender's rolls 1 attack die and suffers 1 %HIT%/%CRIT% damage for each matching result. """
        "Director Krennic":
           display_name: """Director Krennic"""
           text: """<i>Adds %LOCK%</i>%LINEBREAK%<i>Empire only</i>%LINEBREAK%<strong>Setup:</strong> Before placing forces, assign the <strong>Optimized Prototype</strong> condition to another friendly ship."""
        "Discord Missiles":
           display_name: """Discord Missiles"""
           text: """<i>Separatist Alliance only</i>%LINEBREAK%At the start of the Engagement Phase, you may spend 1&nbsp;calculate token and 1&nbsp;%CHARGE% to launch 1&nbsp;buzz droid swarm using the [3&nbsp;%BANKLEFT%], [3&nbsp;%STRAIGHT%], or [3&nbsp;%BANKRIGHT%] template.%LINEBREAK%This card’s %CHARGE% cannot be recovered."""
        "Dorsal Turret":
           display_name: """Dorsal Turret"""
           text: """<i>Adds %ROTATEARC%</i>%LINEBREAK%<strong>Attack</strong>"""
        "Electronic Baffle":
           display_name: """Electronic Baffle"""
           text: """During the End Phase, you may suffer 1&nbsp;%HIT% damage to remove 1 red token."""
        "Elusive":
           display_name: """Elusive"""
           text: """<i>small ship or medium ship only</i>%LINEBREAK%While you defend, you may spend 1&nbsp;%CHARGE% to reroll 1 defense die.%LINEBREAK%After you fully execute a red maneuver, recover 1&nbsp;%CHARGE%."""
        "Emperor Palpatine":
           display_name: """Emperor Palpatine"""
           text: """<i>Empire only</i>%LINEBREAK%While another friendly ship defends or performs an attack, you may spend 1&nbsp;%FORCE% to modify 1 of its dice as though that ship had spent 1&nbsp;%FORCE%."""
        "Energy-Shell Charges":
           display_name: """Energy-Shell Charges"""
           text: """<i>Requires %CALCULATE% or <r>%CALCULATE%</r></i>%LINEBREAK%<i>Separatist Alliance only</i>%LINEBREAK%<strong>Attack (%CALCULATE%):</strong> Spend 1&nbsp;%CHARGE%. While you perform this attack, you may spend 1&nbsp;calculate token to change 1&nbsp;%FOCUS% result to a %CRIT% result.%LINEBREAK%<strong>Action</strong>: Reload this card."""
        "Engine Upgrade":
           display_name: """Engine Upgrade"""
           text: """<i>Adds %BOOST%</i>%LINEBREAK%<i>Requires <r>%BOOST%</r></i>%LINEBREAK%<i class = flavor_text>Large military forces such as the Galactic Empire have standardized engines, but individual pilots and small organizations often replace the power couplings, add thrusters, or use high-performance fuel to get extra push out of their engines.</i>"""
        "Ensnare":
           text: """At the end of the Activation Phase, if you are tractored, you may choose 1 ship in your %SINGLETURRETARC% arc at range 0-1. Transfer 1 tractor token to it."""
        "Expert Handling":
           display_name: """Expert Handling"""
           text: """<i>Adds %BARRELROLL%</i>%LINEBREAK%<i>Requires <r>%BARRELROLL%</r></i>%LINEBREAK%<i class = flavor_text>While heavy fighters can often be coaxed into a barrel roll, seasoned pilots know how to do it without putting undue stress on their craft or leaving themselves open to attack.</i>"""
        "Ezra Bridger":
           display_name: """Ezra Bridger"""
           text: """<i>Rebel only</i>%LINEBREAK%After you perform a primary attack, you may spend 1&nbsp;%FORCE% to perform a bonus %SINGLETURRETARC% attack from a %SINGLETURRETARC% you have not attacked from this round. If you do and you are stressed, you may reroll 1 attack die."""
        "Fanatical":
           display_name: """Fanatical"""
           text: """<i>First Order only</i>%LINEBREAK%While you perform a primary attack, if you are not shielded, you may change 1&nbsp;%FOCUS% result to a %HIT% result."""
        "Fearless":
           display_name: """Fearless"""
           text: """<i>Scum only</i>%LINEBREAK%While you perform a %FRONTARC% primary attack, if the attack range is 1 and you are in the defender’s %FRONTARC%, you may change 1 of your results to a %HIT% result."""
        "Feedback Array":
           display_name: """Feedback Array"""
           text: """Before you engage, you may gain 1 ion token and 1 disarm token. If you do, each ship at range 0 suffers 1&nbsp;%HIT% damage."""
        "Ferrosphere Paint":
           display_name: """Ferrosphere Paint"""
           text: """<i>Resistance only</i>%LINEBREAK%After an enemy ship locks you, if you are not in that ship’s %BULLSEYEARC%, that ship gains 1 stress token."""
        "Fifth Brother":
           display_name: """Fifth Brother"""
           text: """<i>Empire only</i>%LINEBREAK%While you perform an attack, you may spend 1&nbsp;%FORCE% to change 1 of your %FOCUS% results to a %CRIT% result."""
        "Finn":
           display_name: """Finn"""
           text: """<i>Resistance only</i>%LINEBREAK%While you defend or perform a primary attack, if the enemy ship is in your %FRONTARC%, you may add 1 blank result to your roll (this die can be rerolled or otherwise modified)."""
        "Fire-Control System":
           display_name: """Fire-Control System"""
           text: """While you perform an attack, if you have a lock on the defender, you may reroll 1 attack die. If you do, you cannot spend your lock during this attack."""
        "Freelance Slicer":
           display_name: """Freelance Slicer"""
           text: """While you defend, before attack dice are rolled, you may spend a lock you have on the attacker to roll 1 attack die. If you do, the attacker gains 1 jam token. Then, on a %HIT% or %CRIT% result, gain 1 jam token."""
        "GA-97":
           text: """<strong>Setup:</strong> Before placing forces, you may spend 3-5 %CHARGE%. If you do, choose another friendly ship and assign the <strong>It's the Resistance</strong> condition to it."""
        'GNK "Gonk" Droid':
           display_name: """GNK “Gonk” Droid"""
           text: """<strong>Setup:</strong> Lose 1&nbsp;%CHARGE%.%LINEBREAK%<strong>Action:</strong> Recover 1&nbsp;%CHARGE%.%LINEBREAK%<strong>Action:</strong> Spend 1&nbsp;%CHARGE% to recover 1 shield."""
        "General Grievous":
           display_name: """General Grievous"""
           text: """<i>Separatist Alliance only</i>%LINEBREAK%While you defend, after the Neutralize Results step, if there are 2 or more %HIT%/%CRIT% results, you may spend 1&nbsp;%CHARGE% to cancel 1 %HIT% or %CRIT%&nbsp;result. %LINEBREAK%After a friendly ship is destroyed, recover 1&nbsp;%CHARGE%."""
        "General Hux":
           display_name: """General Hux"""
           text: """<i>Requires %COORDINATE% or <r>%COORDINATE%</r></i>%LINEBREAK%<i>First Order only</i>%LINEBREAK%While you perform a white %COORDINATE% action, you may treat it as red. If you do, you may coordinate up to 2 additional ships of the same ship type, and each ship you coordinate must perform the same action, treating that action as red."""
        "Grand Inquisitor":
           display_name: """Grand Inquisitor"""
           text: """<i>Empire only</i>%LINEBREAK%After an enemy ship at range 0-2 reveals its dial, you may spend 1&nbsp;%FORCE% to perform 1 white action on your action bar, treating that action as red."""
        "Grand Moff Tarkin":
           display_name: """Grand Moff Tarkin"""
           text: """<i>Requires %LOCK% or <r>%LOCK%</r></i>%LINEBREAK%<i>Empire only</i>%LINEBREAK%During the System Phase, you may spend 2 %CHARGE%. If you do, each friendly ship may acquire a lock on a ship that you have locked."""
        "Grappling Struts":
           display_name: """Grappling Struts"""
           text: """Closed:%LINEBREAK%<strong>Setup:</strong> Equip this side faceup.%LINEBREAK%While you execute a maneuver, if you overlap an asteroid or debris cloud and there are 1 or fewer other friendly ships at range 0 of that obstacle, you may flip this card.%LINEBREAK%Open:%LINEBREAK%You ignore obstacles at range&nbsp;0 and while you move through them. After you reveal your dial, if you reveal a maneuver other than a [2&nbsp;%STRAIGHT%] and are at range 0 of an asteroid or debris cloud, skip your Execute Maneuver step and remove 1 stress token; if you revealed a right or left maneuver, rotate your ship 90º in that direction. After you execute a maneuver, flip this card."""
        "Greedo":
           display_name: """Greedo"""
           text: """<i>Scum only</i>%LINEBREAK%While you perform an attack, you may spend 1&nbsp;%CHARGE% to change 1&nbsp;%HIT% result to a %CRIT% result.%LINEBREAK%While you defend, if your %CHARGE% is active, the attacker may change 1&nbsp;%HIT% result to a %CRIT% result."""
        "Han Solo":
           display_name: """Han Solo"""
           text: """<i>Rebel only</i>%LINEBREAK%During the Engagement Phase, at initiative 7, you may perform a %SINGLETURRETARC% attack. You cannot attack from that %SINGLETURRETARC% again this round."""
        "Han Solo (Scum)":
           display_name: """Han Solo"""
           text: """<i>Scum only</i>%LINEBREAK%Before you engage, you may perform a red %FOCUS% action."""
        "Han Solo (Resistance)":
           display_name: """Han Solo"""
           text: """<i>Adds <r>%EVADE%</r></i>%LINEBREAK%<i>Resistance only</i>%LINEBREAK%After you perform an %EVADE% action, gain additional evade tokens equal to the number of enemy ships at range 0-1."""
        "Hate":
           display_name: """Hate"""
           text: """After you suffer 1 or more damage, recover that many %FORCE%."""
        "Heavy Laser Cannon":
           display_name: """Heavy Laser Cannon"""
           text: """<strong>Attack:</strong> After the Modify Attack Dice step, change all %CRIT% results to %HIT% results."""
        "Heightened Perception":
           display_name: """Heightened Perception"""
           text: """At the start of the Engagement Phase, you may spend 1&nbsp;%FORCE%. If you do, engage at initiative 7 instead of your standard initiative value this phase."""
        "Hera Syndulla":
           display_name: """Hera Syndulla"""
           text: """<i>Rebel only</i>%LINEBREAK%You can execute red maneuvers even while stressed. After you fully execute a red maneuver, if you have 3 or more stress tokens, remove 1 stress token and suffer 1&nbsp;%HIT% damage."""
        "Heroic":
           display_name: """Heroic"""
           text: """<i>Resistance only</i>%LINEBREAK%While you defend or perform an attack, if you have only blank results and have 2 or more results, you may reroll any number of your dice."""
        "Homing Missiles":
           display_name: """Homing Missiles"""
           text: """<strong>Attack (%LOCK%):</strong> Spend 1&nbsp;%CHARGE%. After you declare the defender, the defender may choose to suffer 1&nbsp;%HIT% damage. If it does, skip the Attack and Defense Dice steps and the attack is treated as hitting."""
        "Hotshot Gunner":
           display_name: """Hotshot Gunner"""
           text: """While you perform a %SINGLETURRETARC% attack, after the Modify Defense Dice step, the defender removes 1 focus or calculate token."""
        "Hull Upgrade":
           display_name: """Hull Upgrade"""
           text: """<i class = flavor_text>For those who cannot afford an enhanced shield generator, bolting additional plates onto the hull of a ship can serve as an adequate substitute.</i>"""
        "Hyperspace Tracking Data":
           display_name: """Hyperspace Tracking Data"""
           text: """<i>large ship only</i>%LINEBREAK%<i>First Order only</i>%LINEBREAK%<strong>Setup:</strong> Before placing forces, you may choose a number between 0 and 6. Treat your initiative as the chosen value during Setup.%LINEBREAK%After Setup, assign 1 focus or evade token to each friendly ship at range&nbsp;0-2."""
        "IG-88D":
           display_name: """IG-88D"""
           text: """<i>Adds %CALCULATE%</i>%LINEBREAK%<i>Scum only</i>%LINEBREAK%You have the pilot ability of each other friendly ship with the <strong>IG-2000</strong> upgrade.%LINEBREAK%After you perform a %CALCULATE% action, gain 1 calculate token."""
        "Ion Bombs":
           display_name: """Ion Bombs"""
           text: """During the System Phase, you may spend 1 %CHARGE% to drop an Ion Bomb using the [1 %STRAIGHT%] template."""
        "ISB Slicer":
           display_name: """ISB Slicer"""
           text: """<i>Empire only</i>%LINEBREAK%During the End Phase, enemy ships at range 1-2 cannot remove jam tokens."""
        "Impervium Plating":
           display_name: """Impervium Plating"""
           text: """Before you would be dealt a faceup <strong>Ship</strong> damage card, you may spend 1&nbsp;%CHARGE% to discard it instead."""
        "Inertial Dampeners":
           display_name: """Inertial Dampeners"""
           text: """Before you would execute a maneuver, you may spend 1 shield. If you do, execute a white [0&nbsp;%STOP%] instead of the maneuver you revealed, then gain 1 stress token."""
        "Informant":
           display_name: """Informant"""
           text: """<strong>Setup:</strong> After placing forces, choose 1 enemy ship and assign the <strong>Listening Device</strong> condition to it."""
        "Instinctive Aim":
           display_name: """Instinctive Aim"""
           text: """While you perform a special attack, you may spend 1&nbsp;%FORCE% to ignore the %FOCUS% or %LOCK% requirement."""
        "Integrated S-Foils":
           display_name: """Integrated S-Foils"""
           text: """<strong>Closed: </strong><i>Adds %BARRELROLL%, %FOCUS% &nbsp;<i class="xwing-miniatures-font xwing-miniatures-font-linked"></i>&nbsp;<r>%BARRELROLL%</r></i>%LINEBREAK% While you perform a primary attack, if the defender is not in your %BULLSEYEARC%, roll 1 fewer attack die. %LINEBREAK% Before you activate, you may flip this card. %LINEBREAK% <b>Open:</b> Before you activate, you may flip this card."""
        "Intimidation":
           display_name: """Intimidation"""
           text: """While an enemy ship at range 0 defends, it rolls 1 fewer defense die."""
        "Ion Cannon":
           display_name: """Ion Cannon"""
           text: """<strong>Attack:</strong> If this attack hits, spend 1&nbsp;%HIT% or %CRIT% result to cause the defender to suffer 1&nbsp;%HIT% damage. All remaining %HIT%/%CRIT% results inflict ion tokens instead of damage."""
        "Ion Cannon Turret":
           display_name: """Ion Cannon Turret"""
           text: """<i>Adds %ROTATEARC%</i>%LINEBREAK%<strong>Attack:</strong> If this attack hits, spend 1&nbsp;%HIT% or %CRIT% result to cause the defender to suffer 1&nbsp;%HIT% damage. All remaining %HIT%/%CRIT% results inflict ion tokens instead of damage."""
        "Ion Missiles":
           display_name: """Ion Missiles"""
           text: """<strong>Attack (%LOCK%):</strong> Spend 1&nbsp;%CHARGE%. If this attack hits, spend 1&nbsp;%HIT% or %CRIT% result to cause the defender to suffer 1&nbsp;%HIT% damage. All remaining %HIT%/%CRIT% results inflict ion tokens instead of damage."""
        "Ion Torpedoes":
           display_name: """Ion Torpedoes"""
           text: """<strong>Attack (%LOCK%):</strong> Spend 1&nbsp;%CHARGE%. If this attack hits, spend 1&nbsp;%HIT% or %CRIT% result to cause the defender to suffer 1&nbsp;%HIT% damage. All remaining %HIT%/%CRIT% results inflict ion tokens instead of damage."""
        "Jabba the Hutt":
           display_name: """Jabba the Hutt"""
           text: """<i>Scum only</i>%LINEBREAK%During the End Phase, you may choose 1 friendly ship at range 0-2 and spend 1&nbsp;%CHARGE%. If you do, that ship recovers 1&nbsp;%CHARGE% on 1 of its equipped %ILLICIT% upgrades."""
        "Jamming Beam":
           display_name: """Jamming Beam"""
           text: """<strong>Attack:</strong> If this attack hits, all %HIT%/%CRIT% results inflict jam tokens instead of damage."""
        "Juke":
           display_name: """Juke"""
           text: """<i>small ship or medium ship only</i>%LINEBREAK%While you perform an attack, if you are evading, you may change 1 of the defender’s %EVADE% results to a %FOCUS% result."""
        "Jyn Erso":
           display_name: """Jyn Erso"""
           text: """<i>Rebel only</i>%LINEBREAK%If a friendly ship at range 0-3 would gain a focus token, it may gain 1 evade token instead."""
        "K2-B4":
           display_name: """K2-B4"""
           text: """<i>Separatist Alliance only</i>%LINEBREAK%While a friendly ship at range&nbsp;0-3 defends, it may spend 1 calculate token. If it does, add 1 %EVADE% result unless the attacker chooses to gain 1&nbsp;strain token."""
        "Kaydel Connix":
           text: """After you reveal your dial, you may set your dial to a basic maneuver of the next higher speed. While you execute that maneuver, increase its difficulty"""
        "Kanan Jarrus":
           display_name: """Kanan Jarrus"""
           text: """<i>Rebel only</i>%LINEBREAK%After a friendly ship at range 0-2 fully executes a white maneuver, you may spend 1&nbsp;%FORCE% to remove 1 stress token from that ship."""
        "Ketsu Onyo":
           display_name: """Ketsu Onyo"""
           text: """<i>Scum only</i>%LINEBREAK%At the start of the End Phase, you may choose 1 enemy ship at range 0-2 in your firing arc. If you do, that ship does not remove its tractor tokens."""
        "Kraken":
           display_name: """Kraken"""
           text: """<i>Adds %CALCULATE%</i>%LINEBREAK%<i>Separatist Alliance only</i>%LINEBREAK%During the End Phase, you may choose up to 3&nbsp;friendly ships at range&nbsp;0-3. If you do, each of these ships does not remove 1&nbsp;calculate token."""
        "Kylo Ren":
           display_name: """Kylo Ren"""
           text: """<i>First Order only</i>%LINEBREAK%<strong>Action:</strong> Choose 1 enemy ship at range 1-3. If you do, spend 1&nbsp;%FORCE% to assign the <strong>I’ll Show You the Dark Side</strong> condition to that ship."""
        "L3-37":
           display_name: """L3-37"""
           text: """<i>Scum only</i>%LINEBREAK%<strong>Setup:</strong> Equip this side faceup.%LINEBREAK%While you defend, you may flip this card. If you do, the attacker must reroll all attack dice.%LINEBREAK%<strong>L3-37’s Programming:</strong> If you are not shielded, decrease the difficulty of your bank (%BANKLEFT% and %BANKRIGHT%) maneuvers."""
        "Kylo Ren":
           display_name: """Kylo Ren"""
           text: """<i>First Order only</i>%LINEBREAK%<strong>Action:</strong> Choose 1 enemy ship at range 1-3. If you do, spend 1&nbsp;%FORCE% to assign the <strong>I’ll Show You the Dark Side</strong> condition to that ship."""
        "Landing Struts":
           display_name: """Landing Struts"""
           text: """Closed:%LINEBREAK%<strong>Setup:</strong> Equip this side faceup.%LINEBREAK%While you execute a maneuver, if you overlap an asteroid or debris cloud and there are 1 or fewer other friendly ships at range 0 of that obstacle, you may flip this card.%LINEBREAK%Open:%LINEBREAK%You ignore obstacles at range&nbsp;0 and while you move through them. After you reveal your dial, if you reveal a maneuver other than a [2&nbsp;%STRAIGHT%] and are at range 0 of an asteroid or debris cloud, skip your Execute Maneuver step and remove 1 stress token; if you revealed a right or left maneuver, rotate your ship 90º in that direction. After you execute a maneuver, flip this card."""
        "Lando Calrissian":
           display_name: """Lando Calrissian"""
           text: """<i>Rebel only</i>%LINEBREAK%<strong>Action:</strong> Roll 2 defense dice. For each %FOCUS% result, gain 1 focus token. For each %EVADE% result, gain 1 evade token. If both results are blank, the opposing player chooses focus or evade. You gain 1 token of that type."""
        "Lando Calrissian (Scum)":
           display_name: """Lando Calrissian"""
           text: """<i>Scum only</i>%LINEBREAK%After you roll dice, you may spend 1 green token to reroll up to 2 of your results."""
        "Lando's Millennium Falcon":
           display_name: """Lando’s Millennium Falcon"""
           text: """<i>Scum only</i>%LINEBREAK%1 escape shuttle may dock with you.%LINEBREAK%While you have an escape shuttle docked, you may treat its shields as if they were on your ship card.%LINEBREAK%While you perform a primary attack against a stressed ship, roll 1 additional attack die. %LINEBREAK%<i>Errata (since rules reference 1.1.0): Replaced “spend" with "treat"</i>"""
        "Latts Razzi":
           display_name: """Latts Razzi"""
           text: """<i>Scum only</i>%LINEBREAK%While you defend, if the attacker is stressed, you may remove 1 stress from the attacker to change 1 of your blank/%FOCUS% results to an %EVADE% result."""
        "Leia Organa":
           display_name: """Leia Organa"""
           text: """<i>Rebel only</i>%LINEBREAK%At the start of the Activation Phase, you may spend 3 %CHARGE%. During this phase, each friendly ship reduces the difficulty of its red maneuvers."""
        "Lone Wolf":
           display_name: """Lone Wolf"""
           text: """While you defend or perform an attack, if there are no other friendly ships at range 0-2, you may spend 1&nbsp;%CHARGE% to reroll 1 of your dice."""
        "Luke Skywalker":
           display_name: """Luke Skywalker"""
           text: """<i>Rebel only</i>%LINEBREAK%At the start of the Engagement Phase, you may spend 1&nbsp;%FORCE% to rotate your %SINGLETURRETARC% indicator."""
        "M9-G8":
           display_name: """M9-G8"""
           text: """<i>Resistance only</i>%LINEBREAK%While a ship you are locking performs an attack, you may choose 1 attack die. If you do, the attacker rerolls that die."""
        "Magva Yarro":
           display_name: """Magva Yarro"""
           text: """<i>Rebel only</i>%LINEBREAK%After you defend, if the attack hit, you may acquire a lock on the attacker."""
        "Marksmanship":
           display_name: """Marksmanship"""
           text: """While you perform an attack, if the defender is in your %BULLSEYEARC%, you may change 1&nbsp;%HIT% result to a %CRIT% result."""
        "Maul":
           display_name: """Maul"""
           text: """<i>Scum or Squad including Ezra Bridger or Squad including Ezra Bridger (Sheathipede) or Squad including Ezra Bridger (TIE Fighter) only</i>%LINEBREAK%After you suffer damage, you may gain 1 stress token to recover 1&nbsp;%FORCE%.%LINEBREAK%You can equip “Dark Side” upgrades."""
        "Minister Tua":
           display_name: """Minister Tua"""
           text: """<i>Empire only</i>%LINEBREAK%At the start of the Engagement Phase, if you are damaged, you may perform a red %REINFORCE% action."""
        "Moff Jerjerrod":
           display_name: """Moff Jerjerrod"""
           text: """<i>Requires %COORDINATE% or <r>%COORDINATE%</r></i>%LINEBREAK%<i>Empire only</i>%LINEBREAK%During the System Phase, you may spend 2 %CHARGE%. If you do, choose the [1&nbsp;%BANKLEFT%], [1&nbsp;%STRAIGHT%], or [1&nbsp;%BANKRIGHT%] template. Each friendly ship may perform a red %BOOST% action using that template."""
        "Munitions Failsafe":
           display_name: """Munitions Failsafe"""
           text: """While you perform a %TORPEDO% or %MISSILE% attack, after rolling attack dice, you may cancel all dice results to recover 1&nbsp;%CHARGE% you spent as a cost for the attack."""
        "Nien Nunb":
           display_name: """Nien Nunb"""
           text: """<i>Rebel only</i>%LINEBREAK%Decrease the difficulty of your bank maneuvers (%BANKLEFT% and %BANKRIGHT%)."""
        "Novice Technician":
           display_name: """Novice Technician"""
           text: """At the end of the round, you may roll 1 attack die to repair 1 faceup damage card. Then on a %HIT% result, expose 1 damage card."""
        "Os-1 Arsenal Loadout":
           display_name: """Os-1 Arsenal Loadout"""
           text: """While you have exactly 1 disarm token, you can still perform %TORPEDO% and %MISSILE% attacks against targets you have locked. If you do, you cannot spend your lock during the attack.%LINEBREAK%Adds %TORPEDO% and %MISSILE% slots."""
        "Outmaneuver":
           display_name: """Outmaneuver"""
           text: """While you perform a %FRONTARC% attack, if you are not in the defender’s firing arc, the defender rolls 1 fewer defense die."""
        "Paige Tico":
           display_name: """Paige Tico"""
           text: """<i>Resistance only</i>%LINEBREAK%After you perform a primary attack, you may drop 1 bomb or rotate your %SINGLETURRETARC%.%LINEBREAK%After you are destroyed, you may drop 1 bomb."""
        "Pattern Analyzer":
           display_name: """Pattern Analyzer"""
           text: """While you fully execute a red maneuver, before the Check Difficulty step, you may perform 1 action."""
        "Perceptive Copilot":
           display_name: """Perceptive Copilot"""
           text: """After you perform a %FOCUS% action, gain 1 focus token."""
        "Petty Officer Thanisson":
           display_name: """Petty Officer Thanisson"""
           text: """<i>First Order only</i>%LINEBREAK%During the Activation or Engagement Phase, after an enemy ship in your %FRONTARC% at range 0-1 gains a red or orange token, if you are not stressed, you may gain 1 stress token. If you do, that ship gains 1 additional token of the type that it gained."""
        "Plasma Torpedoes":
           display_name: """Plasma Torpedoes"""
           text: """<strong>Attack (%LOCK%):</strong> Spend 1&nbsp;%CHARGE%. During the Neutralize Results step, %CRIT% results are cancelled before %HIT% results. After this attack hits, the defender loses 1 shield."""
        "Pivot Wing":
           display_name: """Pivot Wing"""
           text: """<strong>Closed: </strong>While you defend, roll 1 fewer defense die.%LINEBREAK%After you execute a [0&nbsp;%STOP%] maneuver, you may rotate your ship 90º or 180º.%LINEBREAK%Before you activate, you may flip this card.%LINEBREAK%<strong>Open:</Strong> Before you activate, you may flip this card."""
        "Predator":
           display_name: """Predator"""
           text: """While you perform a primary attack, if the defender is in your %BULLSEYEARC%, you may reroll 1 attack die."""
        "Predictive Shot":
           display_name: """Predictive Shot"""
           text: """After you declare an attack, if the defender is in your %BULLSEYEARC%, you may spend 1&nbsp;%FORCE%. If you do, during the Roll Defense Dice step, the defender cannot roll more defense dice than the number of your %HIT%/%CRIT% results."""
        "Primed Thrusters":
           display_name: """Primed Thrusters"""
           text: """<i>small ship only</i>%LINEBREAK%While you have 2 or fewer stress tokens, you can perform %BARRELROLL% and %BOOST% actions even while stressed."""
        "Proton Bombs":
           display_name: """Proton Bombs"""
           text: """<strong>Bomb</strong>%LINEBREAK%During the System Phase, you may spend 1&nbsp;%CHARGE% to drop a Proton Bomb using the [1&nbsp;%STRAIGHT%] template."""
        "Proton Rockets":
           display_name: """Proton Rockets"""
           text: """<strong>Attack (%FOCUS%):</strong> Spend 1&nbsp;%CHARGE%."""
        "Proton Torpedoes":
           display_name: """Proton Torpedoes"""
           text: """<strong>Attack (%LOCK%):</strong> Spend 1&nbsp;%CHARGE%. Change 1&nbsp;%HIT% result to a %CRIT% result."""
        "Proximity Mines":
           display_name: """Proximity Mines"""
           text: """<strong>Mine</strong>%LINEBREAK%During the System Phase, you may spend 1&nbsp;%CHARGE% to drop a Proximity Mine using the [1&nbsp;%STRAIGHT%] template.%LINEBREAK%This card’s %CHARGE% cannot be recovered."""
        "Qi'ra":
           display_name: """Qi’ra"""
           text: """<i>Scum only</i>%LINEBREAK%While you move and perform attacks, you ignore obstacles that you are locking."""
        "R2 Astromech":
           display_name: """R2 Astromech"""
           text: """After you reveal your dial, you may spend 1&nbsp;%CHARGE% and gain 1 disarm token to recover 1 shield."""
        "R2-C4":
           text: """<i>Galactic Republic only</i>%LINEBREAK%While you perform an attack, you may spend 1 evade token to change 1 %FOCUS% result to a %HIT% result."""
        "R2-D2 (Crew)":
           display_name: """R2-D2"""
           text: """<i>Rebel only</i>%LINEBREAK%During the End Phase, if you are damaged and not shielded, you may roll 1 attack die to recover 1 shield. On a %HIT% result, expose 1 of your damage cards."""
        "R2-D2":
           display_name: """R2-D2"""
           text: """<i>Rebel only</i>%LINEBREAK%After you reveal your dial, you may spend 1&nbsp;%CHARGE% and gain 1 disarm token to recover 1 shield."""
        "R2-HA":
           display_name: """R2-HA"""
           text: """<i>Resistance only</i>%LINEBREAK%While you defend, you may spend your lock on the attacker to reroll any number of your defense dice."""
        "R3 Astromech":
           display_name: """R3 Astromech"""
           text: """You can maintain up to 2 locks. Each lock must be on a different object.%LINEBREAK%After you perform a %LOCK% action, you may acquire a lock."""
        "R4 Astromech":
           display_name: """R4 Astromech"""
           text: """<i>small ship only</i>%LINEBREAK%Decrease the difficulty of your speed 1-2 basic maneuvers (%TURNLEFT%, %BANKLEFT%, %STRAIGHT%, %BANKRIGHT%, %TURNRIGHT%)."""
        "R4-P Astromech":
           display_name: """R4-P Astromech"""
           text: """<i>Galactic Republic only</i>%LINEBREAK%Before you execute a basic maneuver, you may spend 1&nbsp;%CHARGE%. If you do, while you execute that maneuver, reduce its difficulty."""
        "R4-P17":
           display_name: """R4-P17"""
           text: """<i>Galactic Republic only</i>%LINEBREAK%After you fully execute a red maneuver, you may spend 1&nbsp;%CHARGE% to perform an action, even while stressed."""
        "R4-P44":
           display_name: """R4-P44"""
           text: """<i>Galactic Republic only</i>%LINEBREAK%After you fully execute a red maneuver, if there is an enemy ship in your %BULLSEYEARC%, gain 1&nbsp;calculate token."""
        "R5 Astromech":
           display_name: """R5 Astromech"""
           text: """<strong>Action:</strong> Spend 1&nbsp;%CHARGE% to repair 1 facedown damage card.%LINEBREAK%<strong>Action:</strong> Repair 1 faceup <strong>Ship</strong> damage card."""
        "R5-D8":
           display_name: """R5-D8"""
           text: """<i>Rebel only</i>%LINEBREAK%<strong>Action:</strong> Spend 1&nbsp;%CHARGE% to repair 1 facedown damage card.%LINEBREAK%<strong>Action:</strong> Repair 1 faceup <strong>Ship</strong> damage card."""
        "R5-P8":
           display_name: """R5-P8"""
           text: """<i>Scum only</i>%LINEBREAK%While you perform an attack against a defender in your %FRONTARC%, you may spend 1&nbsp;%CHARGE% to reroll 1 attack die. If the rerolled result is a %CRIT% result, suffer 1&nbsp;%CRIT% damage."""
        "R5-TK":
           display_name: """R5-TK"""
           text: """<i>Scum only</i>%LINEBREAK%You can perform attacks against friendly ships."""
        "R5-X3":
           display_name: """R5-X3"""
           text: """<i>Resistance only</i>%LINEBREAK%Before you activate or engage, you may spend 1&nbsp;%CHARGE% to ignore obstacles until the end of this phase."""
        "Rey":
           display_name: """Rey"""
           text: """<i>Resistance only</i>%LINEBREAK%While you defend or perform an attack, if the enemy ship is in your %SINGLETURRETARC%, you may spend 1&nbsp;%FORCE% to change 1 of your blank results to a %EVADE% or %HIT% result."""
        "Rey's Millennium Falcon":
           display_name: """Rey’s Millennium Falcon"""
           text: """<i>Resistance only</i>%LINEBREAK%If you have 2 or fewer stress tokens, you can execute red Segnor’s Loop [%SLOOPLEFT% or %SLOOPRIGHT%] maneuvers and perform %BOOST% and&nbsp;%ROTATEARC% actions even while stressed."""
        "Rigged Cargo Chute":
           display_name: """Rigged Cargo Chute"""
           text: """<i>large ship or medium ship only</i>%LINEBREAK%<strong>Action:</strong> Spend 1&nbsp;%CHARGE%. Drop 1 loose cargo using the [1&nbsp;%STRAIGHT%] template."""
        "Rose Tico":
           display_name: """Rose Tico"""
           text: """<i>Resistance only</i>%LINEBREAK%While you defend or perform an attack, you may spend 1 of your results to acquire a lock on the enemy ship."""
        "Ruthless":
           display_name: """Ruthless"""
           text: """<i>Empire only</i>%LINEBREAK%While you perform an attack, you may choose another friendly ship at range 0-1 of the defender. If you do, that ship suffers 1&nbsp;%HIT% damage and you may change 1 of your die results to a %HIT% result."""
        "Sabine Wren":
           display_name: """Sabine Wren"""
           text: """<i>Rebel only</i>%LINEBREAK%<strong>Setup:</strong> Place 1 ion, 1 jam, 1 stress, and 1 tractor token on this card. %LINEBREAK%After a ship suffers the effect of a friendly bomb, you may remove 1 ion, jam, stress, or tractor token from this card. If you do, that ship gains a matching token."""
        "Saturation Salvo":
           display_name: """Saturation Salvo"""
           text: """<i>Requires %RELOAD% or <r>%RELOAD%</r></i>%LINEBREAK%While you perform a %TORPEDO% or %MISSILE% attack, you may spend 1&nbsp;%CHARGE% from that upgrade. If you do, choose two defense dice. The defender must reroll those dice."""
        "Saw Gerrera":
           display_name: """Saw Gerrera"""
           text: """<i>Rebel only</i>%LINEBREAK%While you perform an attack, you may suffer 1&nbsp;%HIT% damage to change all of your %FOCUS% results to %CRIT% results."""
        "Seasoned Navigator":
           display_name: """Seasoned Navigator"""
           text: """After you reveal your dial, you may set your dial to another non-red maneuver of the same speed. While you execute that maneuver, increase its difficulty."""
        "Seismic Charges":
           display_name: """Seismic Charges"""
           text: """<strong>Bomb</strong>%LINEBREAK%During the System Phase, you may spend 1&nbsp;%CHARGE% to drop a Seismic Charge with the [1&nbsp;%STRAIGHT%] template."""
        "Selfless":
           display_name: """Selfless"""
           text: """<i>Rebel only</i>%LINEBREAK%While another friendly ship at range 0-1 defends, before the Neutralize Results step, if you are in the attack arc, you may suffer 1&nbsp;%CRIT% damage to cancel 1&nbsp;%CRIT% result."""
        "Sense":
           display_name: """Sense"""
           text: """During the System Phase, you may choose 1 ship at range 0-1 and look at its dial. If you spend 1&nbsp;%FORCE%, you may choose a ship at range 0-3 instead."""
        "Servomotor S-Foils":
           display_name: """Servomotor S-Foils"""
           text: """<strong>Closed: </strong><i>Adds %BOOST% ,  %FOCUS%&nbsp;<i class="xwing-miniatures-font xwing-miniatures-font-linked"></i>&nbsp;<r>%BOOST%</r></i>%LINEBREAK% While you perform a primary attack, roll 1 fewer attack die.%LINEBREAK%Before you activate, you may flip this card.%LINEBREAK%<strong>Open:</strong> Before you activate, you may flip this card."""
        "Seventh Fleet Gunner":
           display_name: """Seventh Fleet Gunner"""
           text: """<i>Galactic Republic only</i>%LINEBREAK%While another friendly ship performs a primary attack, if the defender is in your firing arc, you may spend 1 %CHARGE%. If you do, the attacker rolls 1&nbsp;additional die, to a maximum of 4. During the System Phase, you may gain 1 disarm token to recover 1 %CHARGE%."""
        "Seventh Sister":
           display_name: """Seventh Sister"""
           text: """<i>Empire only</i>%LINEBREAK%If an enemy ship at range 0-1 would gain a stress token, you may spend 1&nbsp;%FORCE% to have it gain 1 jam or tractor token instead."""
        "Shield Upgrade":
           display_name: """Shield Upgrade"""
           text: """<i class = flavor_text>Deflector shields are a substantial line of defense on most starships beyond the lightest fighters. While enhancing a ship’s shield capacity can be costly, all but the most confident or reckless pilots see the value in this sort of investment.</i>"""
        "Skilled Bombardier":
           display_name: """Skilled Bombardier"""
           text: """If you would drop or launch a device, you may use a template of the same bearing with a speed 1 higher or lower."""
        "Spare Parts Canisters":
           display_name: """Spare Parts Canisters"""
           text: """<strong>Action:</strong> Spend 1&nbsp;%CHARGE% to recover 1&nbsp;charge on one of your equipped %ASTROMECH% upgrades. %LINEBREAK%<strong>Action:</strong> Spend 1&nbsp;%CHARGE% to drop 1 spare parts, then break all locks assigned to you."""
        "Special Forces Gunner":
           display_name: """Special Forces Gunner"""
           text: """<i>First Order only</i>%LINEBREAK%While you perform a primary %FRONTARC% attack, if your %SINGLETURRETARC% is in your %FRONTARC%, you may roll 1&nbsp;additional attack die.%LINEBREAK%After you perform a primary %FRONTARC% attack, if your %SINGLETURRETARC% is in your %REARARC%, you may perform a bonus primary %SINGLETURRETARC% attack."""
        "Squad Leader":
           display_name: """Squad Leader"""
           text: """<i>Adds <r>%COORDINATE%</r></i>%LINEBREAK%While you coordinate, the ship you choose can perform an action only if that action is also on your action bar."""
        "Static Discharge Vanes":
           display_name: """Static Discharge Vanes"""
           text: """Before you would gain 1 ion or jam token, if you are not stressed, you may choose another ship at range 0-1 and gain 1 stress token. If you do, the chosen ship gains that ion or jam token instead, then you suffer 1 %HIT% damage. %LINEBREAK%<i>Errata (since rules reference 1.1.0): Changed from "If you would gain an ion or jam token, if you are not stressed, you may choose a ship at range 0-1. If you do, gain 1 stress token and transfer 1 ion or jam token to that ship."</i>"""
        "Stealth Device":
           display_name: """Stealth Device"""
           text: """While you defend, if your %CHARGE% is active, roll 1 additional defense die.%LINEBREAK%After you suffer damage, lose 1&nbsp;%CHARGE%."""
        "Supernatural Reflexes":
           display_name: """Supernatural Reflexes"""
           text: """<i>small ship only</i>%LINEBREAK%Before you activate, you may spend 1&nbsp;%FORCE% to perform a %BARRELROLL% or %BOOST% action. Then, if you performed an action you do not have on your action bar, suffer 1&nbsp;%HIT% damage."""
        "Supreme Leader Snoke":
           display_name: """Supreme Leader Snoke"""
           text: """<i>First Order only</i>%LINEBREAK%During the System Phase, you may choose any number of enemy ships beyond range 1. If you do, spend that many %FORCE% to flip each chosen ship’s dial faceup."""
        "Swarm Tactics":
           display_name: """Swarm Tactics"""
           text: """At the start of the Engagement Phase, you may choose 1 friendly ship at range 1. If you do, that ship treats its initiative as equal to yours until the end of the round."""
        "Synchronized Console":
           display_name: """Synchronized Console"""
           text: """<i>Requires %LOCK% or <r>%LOCK%</r></i>%LINEBREAK%<i>Galactic Republic only</i>%LINEBREAK%After you perform an attack, you may choose a friendly ship at range 1 or a friendly ship with the <strong>Synchronized Console</strong> upgrade at range 1-3 and spend a lock you have on the defender. If you do, the friendly ship you chose may acquire a lock on the defender."""
        "TA-175":
           display_name: """TA-175"""
           text: """After a friendly ship at range 0-3 with %CALCULATE% on its action bar is destroyed, each friendly ship at range 0-3 with %CALCULATE% in its action bar gains 1 calculate token."""
        "TV-94":
           display_name: """TV-94"""
           text: """<i>Separatist Alliance only</i>%LINEBREAK%While a friendly ship at range&nbsp;0-3 performs a primary attack against a defender in its %BULLSEYEARC%, if there are 2&nbsp;or fewer attack dice, it may spend 1&nbsp;calculate token to add 1&nbsp;%HIT%&nbsp;result."""
        "Tactical Officer":
           display_name: """Tactical Officer"""
           text: """<i>Adds %COORDINATE%</i>%LINEBREAK%<i>Requires <r>%COORDINATE%</r></i>%LINEBREAK%<i class = flavor_text>In the chaos of a starfighter battle, a single order can mean the difference between a victory and a massacre.</i>"""
        "Tactical Scrambler":
           display_name: """Tactical Scrambler"""
           text: """<i>large ship or medium ship only</i>%LINEBREAK%While you obstruct an enemy ship’s attack, the defender rolls 1 additional defense die."""
        "Targeting Computer":
           text: """<i>Adds %LOCK%</i>"""
        "Targeting Synchronizer":
           display_name: """Targeting Synchronizer"""
           text: """<i>Requires %LOCK% or <r>%LOCK%</r></i>%LINEBREAK%While a friendly ship at range 1-2 performs an attack against a target you have locked, that ship ignores the&nbsp;%LOCK% attack requirement."""
        "Tobias Beckett":
           display_name: """Tobias Beckett"""
           text: """<i>Scum only</i>%LINEBREAK%<strong>Setup:</strong> After placing forces, you may choose 1 obstacle in the play area. If you do, place it anywhere in the play area beyond range 2 of any board edge or ship and beyond range 1 of other obstacles."""
        "Tractor Beam":
           display_name: """Tractor Beam"""
           text: """<strong>Attack:</strong> If this attack hits, all %HIT%/%CRIT% results inflict tractor tokens instead of damage."""
        "Trajectory Simulator":
           display_name: """Trajectory Simulator"""
           text: """During the System Phase, if you would drop or launch a bomb, you may launch it using the [5&nbsp;%STRAIGHT%] template instead."""
        "Treacherous":
           display_name: """Treacherous"""
           text: """<i>Separatist Alliance only</i>%LINEBREAK%While you defend, you may choose a ship obstructing the attack and spend 1 %CHARGE%. If you do, cancel 1 %HIT% or %CRIT% result, and the ship you chose gains 1 strain token.%LINEBREAK%After a ship at range 0-3 is destroyed, recover 1 %CHARGE%."""
        "Trick Shot":
           display_name: """Trick Shot"""
           text: """While you perform an attack that is obstructed by an obstacle, roll 1 additional attack die."""
        "Unkar Plutt":
           display_name: """Unkar Plutt"""
           text: """<i>Scum only</i>%LINEBREAK%After you partially execute a maneuver, you may suffer 1&nbsp;%HIT% damage to perform 1 white action."""
        "Veteran Tail Gunner":
           display_name: """Veteran Tail Gunner"""
           text: """After you perform a primary %FRONTARC% attack, you may perform a bonus primary %REARARC% attack."""
        "Veteran Turret Gunner":
           display_name: """Veteran Turret Gunner"""
           text: """<i>Requires <r>%ROTATEARC%</r> or %ROTATEARC%</i>%LINEBREAK%After you perform a primary attack, you may perform a bonus %SINGLETURRETARC% attack using a %SINGLETURRETARC% you did not already attack from this round."""
        "Xg-1 Assault Configuration":
           display_name: """Xg-1 Assault Configuration"""
           text: """While you have exactly 1 disarm token, you can still perform %CANNON% attacks. While you perform a %CANNON% attack while disarmed, roll a maximum of 3 attack dice.%LINEBREAK%Adds %CANNON% slot."""
        "Zuckuss":
           display_name: """Zuckuss"""
           text: """<i>Scum only</i>%LINEBREAK%While you perform an attack, if you are not stressed, you may choose 1 defense die and gain 1 stress token. If you do, the defender must reroll that die."""
        '"Chopper" (Crew)':
           display_name: """“Chopper”"""
           text: """<i>Rebel only</i>%LINEBREAK%During the Perform Action step, you may perform 1 action, even while stressed. After you perform an action while stressed, suffer 1&nbsp;%HIT% damage unless you expose 1 of your damage cards."""
        '"Chopper" (Astromech)':
           display_name: """“Chopper”"""
           text: """<i>Rebel only</i>%LINEBREAK%<strong>Action:</strong> Spend 1 non-recurring &nbsp;%CHARGE% from another equipped upgrade to recover 1 shield. %LINEBREAK%<strong>Action:</strong> Spend 2 shields to recover 1 non-recurring %CHARGE% on an equipped upgrade."""
        '"Genius"':
           display_name: """“Genius”"""
           text: """<i>Scum only</i>%LINEBREAK%After you fully execute a maneuver, if you have not dropped or launched a device this round, you may drop 1 bomb."""
        '"Zeb" Orrelios':
           display_name: """“Zeb” Orrelios"""
           text: """<i>Rebel only</i>%LINEBREAK%You can perform primary attacks at range 0. Enemy ships at range 0 can perform primary attacks against you."""
        "Kaydel Connix":
           display_name: """Kaydel Connix"""
           text: """After you reveal your dial, you may set your dial to a basic maneuver of the next higher speed. While you execute that maneuver, increase its' difficulty."""
        "Autoblasters":
           display_name: """Autoblasters"""
           text: """<strong>Attack:</strong> If the defender is in your %BULLSEYEARC%, roll 1 additional die. During the Neutralize Results step, if you are not in the defender's %FRONTARC%, %EVADE% results do not cancel %CRIT% results. """
        "R2-C4":
           display_name: """R2-C4"""
           text: """While you perform an attack, you may spend 1 evade token to change 1 %FOCUS% result to a %HIT% result. """
        "Electro-Proton Bomb":
           display_name: """Electro-Proton Bomb"""
           text: """<strong>Bomb</strong>%LINEBREAK%During the System Phase, you may spend 1 %CHARGE% to drop an Electro-Proton Bomb with the [1 %STRAIGHT%] template. Then place 1 fuse marker on that device. %LINEBREAK%This card’s %CHARGE% cannot be recovered."""
        "Passive Sensors":
           display_name: """Passive Sensors"""
           text: """<strong>Action:</strong> Spend 1 %CHARGE%. You can only perform this action in your Perform Action step. %LINEBREAK% While your %CHARGE% is inactive, you cannot be coordinated. Before you engage, if your %CHARGE% is inactive, you may perform a %CALCULATE% or %LOCK% action."""
        "R2-A6":
           display_name: """R2-A6"""
           text: """<i>Galactic Republic only</i>%LINEBREAK% After you reveal your dial, you may set your dial to a maneuver of the same bearing of a speed 1 higher or lower."""
        "Amilyn Holdo":
           display_name: """Amilyn Holdo"""
           text: """<i>Resistance only</i>%LINEBREAK% Before you engage, you may choose another friendly ship at range 1-2. You may transfer to that ship 1 token of a type that ship does not have. That ship may transfer 1 token to you of a type you do not have."""
        "Larma D'Acy":
           display_name: """Larma D'Acy"""
           text: """<i>Resistance only</i>%LINEBREAK% While you have 2 or fewer stress tokens, you can perform %REINFORCE%, %COORDINATE%, and %JAM% actions, even while stressed.%LINEBREAK% While you perform a white %REINFORCE%, %COORDINATE%, or %JAM% action, if you are stressed, treat that action as red."""
        "PZ-4CO":
           display_name: """PZ-4CO"""
           text: """<i>Resistance only</i>%LINEBREAK% <i>Adds %CALCULATE%</i>%LINEBREAK% At the end of the Activation Phase, you may choose 1 friendly ship at range 1-2. If you do, transfer 1 calculate token to that ship. If your revealed maneuver is blue, you may transfer 1 focus token instead."""
        "Leia Organa (Resistance)":
           display_name: """Leia Organa"""
           text: """<i>Resistance only</i>%LINEBREAK% <i>Adds %F-COORDINATE%</i>%LINEBREAK% After a friendly ship reveals its dial, you may spend 1 %FORCE%. If you do, the chosen ship reduces the difficulty of that maneuver."""
        "Korr Sella":
           display_name: """Korr Sella"""
           text: """<i>Resistance only</i>%LINEBREAK% After you fully execute a blue maneuver, remove all of your stress tokens."""
        "Precognitive Reflexes":
           display_name: """Precognitive Reflexes"""
           text: """<i>small ship only</i>%LINEBREAK%After you reveal your dial, you may spend 1 %FORCE% to perform a %BARRELROLL% or %BOOST% action. Then, if you performed an action you do not have on your action bar, gain 1 strain token. %LINEBREAK% If you do, you cannot perform another action during your activation."""
        "Foresight":
           display_name: """Foresight"""
           text: """After an enemy ship executes a maneuver, you may spend 1 %FORCE% to perform this attack against it as a bonus attack. %LINEBREAK% <strong>Attack:</strong> You may change 1 %FOCUS% result to a %HIT% result; your dice cannot be modified otherwise."""
        "Angled Deflectors":
           display_name: """Angled Deflectors"""
           text: """<strong>Requires:</strong> Small or Medium Ship with at least 1 shield %LINEBREAK% <strong>Adds:</strong> %REINFORCE% %LINEBREAK% <strong>Removes:</strong> 1 Shield """
            
        "C1-10P":
           display_name: """C1-10P"""
           text: """<strong>C1-10P: </strong>Setup: Equip this side faceup. %LINEBREAK% After you execute a maneuver, you may spend 1 %CHARGE% to perform a red %EVADE% action, even while stressed. %LINEBREAK% During the End Phase, if this card has 0 active %CHARGE%, flip it. %LINEBREAK% <strong>C1-10P (Erratic):</strong> After you execute a maneuver, you <strong>must</strong> choose a ship at range 0-1. It gains 1 jam token."""
        "Ahsoka Tano":
           display_name: """Ahsoka Tano"""
           text: """After you execute a maneuver, you may spend 1 %FORCE% and choose a friendly ship at range 1-3 in your firing arc. If you do, it may perform a red %FOCUS% action, even while stressed."""
        "C-3PO (Republic)":
           display_name: """C-3PO"""
           text: """While you defend, if you are calculating, you may reroll 1 defense die. %LINEBREAK% After you perform a %CALCULATE% action, gain 1 calculate token."""
        "Gravitic Deflection":
           display_name: """Gravitic Deflection"""
           text: """While you defend, you may reroll 1 defense die for each tractored ship in the attack arc."""
        "Snap Shot":
           display_name: """Snap Shot"""
           text: """After an enemy ship executes a maneuver, you may perform this attack against it as a bonus attack. %LINEBREAK% <strong>Attack:</strong> Your dice cannot be modified."""
        "Deuterium Power Cells":
           display_name: """Deuterium Power Cells"""
           text: """During the System Phase, you may spend 1 %CHARGE% and gain 1 disarm token to recover 1 %SHIELD%. Before you would gain 1 non-lock token, if you are not stressed, you may spend 1 %CHARGE% to gain 1 stress token instead."""
        "Mag-Pulse Warheads":
           display_name: """Mag-Pulse Warheads"""
           text: """<strong>Attack (%LOCK%):</strong> Spend 1 %CHARGE%. If this attack hits, the defender suffers 1 %CRIT% damage and gains 1 deplete and 1 jam token. Then cancel all %HIT%/%CRIT% results."""
        "Coaxium Hyperfuel":
           display_name: """Coaxium Hyperfuel"""
           text: """You can perform the %SLAM% action even while stressed. If you do, you suffer 1 %CRIT% damage unless you expose 1 of your damage cards. %LINEBREAK% After you partially execute a maneuver, you may expose 1 of your damage cards or suffer 1 %CRIT% damage to perform a %SLAM% action."""
        "R1-J5":
           display_name: """R1-J5"""
           text: """While you have 2 or fewer stress tokens, you can perform actions on damage cards even while stressed. %LINEBREAK% After you repair a damage card with the <b>Ship</b> trait, you may spend 1 %CHARGE% to repair that card again."""
        "Stabilized S-Foils":
           display_name: """Stabilized S-Foils"""
           text: """<strong>Closed: </strong><i>Adds <r>%RELOAD%</r>, %BARRELROLL% <i class="xwing-miniatures-font xwing-miniatures-font-linked"></i><r> %EVADE%</r></i>%LINEBREAK% Before you activate, if you are not critically damaged, you may flip this card. %LINEBREAK% <strong>Open:</strong> <i>Adds %BARRELROLL% <i class="xwing-miniatures-font xwing-miniatures-font-linked"></i><r> %LOCK%</r></i>%LINEBREAK% After you perform an attack, you may spend your lock on the defender to perform a bonus %CANNON% attack against that ship using a %CANNON% upgrade you have not attacked with this turn. %LINEBREAK% Before you activate, if you are not critically damaged, you may flip this card."""
        "K-2SO":
           text: """Adds %CALCULATE%, %JAM% %LINEBREAK% During the System Phase, you may choose a friendly ship at range 0-3. That ship gains 1 calculate token and 1 stress token."""
        "Proud Tradition":
           text: """<strong>Proud Tradition</strong>%LINEBREAK%<strong>Setup:</strong> Equip this side faceup. %LINEBREAK% While you have 2 or fewer stress tokens, you may peform %FOCUS% actions even while stressed. After you perform an attack, if you are stressed, the defender may spend 1 focus token or suffer 1 %CRIT% damage to flip this card. %LINEBREAK% <strong>False Tradition</strong>%LINEBREAK% Treat your %FOCUS% actions as red."""
        "Cluster Mines":
           text: """During the System Phase, you may spend 1 %CHARGE% to drop a Cluster Mine set using the [1 %STRAIGHT%] template. %LINEBREAK% This card's %CHARGE% cannot be recovered."""
        "Kaz's Fireball":
           text: """<strong>Setup:</strong> When you resolve <strong>Explosion with Wings</strong>, you may search the damage deck and choose a damage card with the <b>Ship</b> trait: you are dealt that card instead. Then, shuffle the damage deck. %LINEBREAK% You can perform actions of damage cards even while ionized."""
        "Agent Terex":
           text: """<strong>Cyborg: Setup:</strong> Equip this side faceup and place 3 calculate tokens on this card. %LINEBREAK% At the start of the Engagement Phase, you may choose a friendly ship at range 0-3 and remove 1 calculate token from this card to have that ship gain a matching token. Then, if there are no calculate tokens on this card, flip it. %LINEBREAK%<strong>Cyborg:</strong> During the System Phase, roll 1 attack die. On a %HIT% or %CRIT% result, gain 1 calculate token. Otherwise gain 1 jam token. %LINEBREAK% <strong>Action:</strong> Transfer 1 calculate token or 1 jam token to a ship at range 0-3."""
        "Plo Koon":
           text: """At the start of the End Phase, if you are reinforced, you may choose 1 friendly ship at range 0 or in your %LEFTARC% or %RIGHTARC% at range 1. That ship removes 1 deplete or strain token, or repairs 1 faceup damage card."""
        "Commander Pyre":
           text: """<strong>Setup:</strong> After placing forces, choose an enemy ship. It gains 2 stress tokens. While you defend, if the attacker is stressed, you may reroll 1 defense die."""
        "Clone Captain Rex":
           text: """While you perform an attack, you may spend 1 %FOCUS% result. If you do, each friendly ship that has the defender in its %BULLSEYEARC% may gain 1 strain token to perform a %FOCUS% action."""
        "Yoda":
           text: """After another friendly ship at range 0-2 fully executes a purple maneuver or performs a purple action, you may spend 1 %FORCE%. If you do, that ship recovers 1 %FORCE%."""
        "Repulsorlift Stabilizers":
           text: """<strong>Inactive: Setup:</strong>Equip this side faceup. Reduce the difficulty of your straight %STRAIGHT% maneuvers.%LINEBREAK% After you fully execute a maneuver, you may flip this card. %LINEBREAK%<strong>Active: </strong>After you reveal a bank (%BANKLEFT% or %BANKRIGHT%) or turn (%TURNLEFT% or %TURNRIGHT%), you must perform that maneuver as a slideslip, then flip this card. %LINEBREAK%After you fully execute a non-sideslip maneuver, you may flip this card."""
        "Multi-Missle Pods":
           text: """<strong>Attack (%CALCULATE% or %LOCK%):</strong> Spend 1 %CHARGE%. If the defender is in your %FRONTARC%, you may spend 1 %CHARGE% to roll 1 additional attack die. If the defender is in your %BULLSEYEARC%, you may spend up to 2 %CHARGE% to roll that many additional attack dice instead."""
            
        # Epic upgrades
        "Admiral Ozzel":
           display_name: """Admiral Ozzel"""
           text: """While a friendly large or huge ship at range 0-3 executes a maneuver, it may suffer 1 %HIT% damage to execute a maneuver of the same bearing and difficulty of a speed 1 higher or lower instead."""
        "Azmorigan":
           display_name: """Azmorigan"""
           text: """During the End Phase, you may choose up to 2 friendly ships at range 0-1. If you do, each of these ships does not remove 1 calculate or evade token."""
        "Captain Needa":
           display_name: """Captain Needa"""
           text: """After a friendly ship at range 0-4 reveals its dial, you may spend 1 %CHARGE%. If you do, it sets its dial to another maneuver of the same difficulty and speed."""
        "Strategic Commander":
           display_name: """Strategic Commander"""
           text: """After a friendly ship at range 0-4 reveals its dial, you may spend 1 %CHARGE%. If you do, it sets its dial to another maneuver of the same difficulty and speed."""
        "Carlist Rieekan":
           display_name: """Carlist Rieekan"""
           text: """After a friendly ship at range 0-2 is destroyed, you may choose a friendly ship at range 0-2. If you do, it may perform a red %EVADE% action."""
        "Jan Dodonna":
           display_name: """Jan Dodonna"""
           text: """Friendly ships at range 0-3 can spend your focus and evade tokens."""
        "Raymus Antilles":
           display_name: """Raymus Antilles"""
           text: """After you are destroyed, each friendly ship at range 0-1 gains 1 focus token. After you are destroyed, you are not removed until the end of the End Phase."""
        "Stalwart Captain":
           display_name: """Stalwart Captain"""
           text: """After you are destroyed, you are not removed until the end of the End Phase."""
        "Agent of the Empire":
           display_name: """Agent of the Empire"""
           text: """You are a <strong>wing leader</strong>. Your wingmates must be 2, 3, 4, or 5 TIE/ln fighters. %LINEBREAK% While you defend, up to 2 of your wingmates in the attack arc may suffer 1 %HIT% or %CRIT% damage to cancel a matching result."""
        "First Order Elite":
           display_name: """First Order Elite"""
           text: """You are a <strong>wing leader</strong>. Your wingmates must be 2 or 3 TIE/fo fighters or TIE/sf fighters. %LINEBREAK% While you defend, up to 2 of your wingmates in the attack arc may suffer 1 %HIT% or %CRIT% damage to cancel a matching result."""
        "Veteran Wing Leader":
           display_name: """Veteran Wing Leader"""
           text: """You are a <strong>wing leader</strong>. Your wingmates must be 2, 3, 4, or 5 other ships of your ship type. %LINEBREAK% While you defend, up to 2 of your wingmates in the attack arc may suffer 1 %HIT% or %CRIT% damage to cancel a matching result."""
        "Dreadnought Hunter":
           display_name: """Dreadnought Hunter"""
           text: """<strong>Requires:</strong> Small ship and initiative 4 or higher.</i>%LINEBREAK% While you perform an attack against a huge ship, if the attack deals a faceup damage card to the defender and the defender is in your %BULLSEYEARC%, you may apply the <strong>Precision Shot</strong> effect even if you are not in the specified arc."""
        "Ion Cannon Battery":
           display_name: """Ion Cannon Battery"""
           text: """<strong>Online: </strong> Setup: Equip this side faceup.%LINEBREAK% Bonus Attack: Spend 1 %ENERGY%. If this attack hits, the defender suffers 1 %CRIT% damage, and all %HIT%/%CRIT% results inflict ion tokens instead of damage. %LINEBREAK%<strong>Offline: </strong> %LINEBREAK% After you engage, you may spend 2 %ENERGY% to flip this card."""
        "Targeting Battery":
           display_name: """Targeting Battery"""
           text: """<strong>Online: </strong> Setup: Equip this side faceup.%LINEBREAK% Bonus Attack: Spend 1 %ENERGY%. After you perform this attack, you may acquire a lock on the defender. %LINEBREAK%<strong>Offline: </strong> %LINEBREAK% After you engage, you may spend 2 %ENERGY% to flip this card."""
        "Ordnance Tubes":
           display_name: """Ordnance Tubes"""
           text: """<strong>Online: </strong> Setup: Equip this side faceup. %LINEBREAK% You can perform %TORPEDO% and %MISSILE% attacks only as bonus attacks. You <strong>must</strong> treat the %FRONTARC% requirement of your equipped %TORPEDO% and %MISSILE% upgrades as %FULLFRONTARC%. %LINEBREAK% Bonus Attack: Perform a %TORPEDO% attack. %LINEBREAK% Bonus Attack: Perform a %MISSILE% attack. %LINEBREAK%<strong>Offline: </strong> %LINEBREAK% You must treat the %FRONTARC% requirement of your equipped %TORPEDO% and %MISSILE% upgrades as %BULLSEYEARC%. %LINEBREAK% Action: Spend 2 %ENERGY% to flip this card."""
        "Point-Defense Battery":
           display_name: """Point-Defense Battery"""
           text: """<strong>Online: </strong> Setup: Equip this side faceup. %LINEBREAK% Bonus Attack: Spend 1 %ENERGY%. %LINEBREAK% Bonus Attack: Spend 1 %ENERGY%. %LINEBREAK% Bonus Attack: Spend 1 %ENERGY%. %LINEBREAK% Bonus Attack: Spend 1 %ENERGY%. %LINEBREAK%<strong>Offline: </strong> %LINEBREAK% After you engage, you may spend 2 %ENERGY% to flip this card."""
        "Turbolaser Battery":
           display_name: """Turbolaser Battery"""
           text: """<strong>Requires:</strong> 5 or more energy</i>%LINEBREAK%<i><strong>Online: </strong> Setup: Equip this side faceup.%LINEBREAK% Bonus Attack (%LOCK%): Spend 3 %ENERGY%. If this attack hits, add 3 %HIT% results. %LINEBREAK% <strong>Offline: </strong> %LINEBREAK% After you engage, you may spend 2 %ENERGY% to flip this card."""
        "Bombardment Specialists":
           display_name: """Bombardment Specialists"""
           text: """Adds %LOCK% <i class="xwing-miniatures-font xwing-miniatures-font-linked"></i> %CALCULATE%. %LINEBREAK% While you perform an attack, you may spend 1 calculate token to increase or decrease the range requirement by 1, to a limit of 0-5."""
        "Comms Team":
           display_name: """Comms Team"""
           text: """Adds %COORDINATE% <i class="xwing-miniatures-font xwing-miniatures-font-linked"></i> %CALCULATE%, %JAM% <i class="xwing-miniatures-font xwing-miniatures-font-linked"></i> %CALCULATE%. %LINEBREAK% After you perform a %COORDINATE% action, you may spend up to 2 %ENERGY% to coordinate that many additional ships at range 0-1 of the ship you coordinated."""
        "IG-RM Droids":
           display_name: """IG-RM Droids"""
           text: """While you perform an attack, if you are calculating, you may change 1 %HIT% result to a %CRIT% result."""
        "Gunnery Specialists":
           display_name: """Gunnery Specialists"""
           text: """Adds %ROTATEARC% <i class="xwing-miniatures-font xwing-miniatures-font-linked"></i> %CALCULATE%. %LINEBREAK% While you perform a primary or %HARDPOINT% attack, you may spend 1 or more %ENERGY% to reroll that many attack dice."""
        "Damage Control Team":
           display_name: """Damage Control Team"""
           text: """Adds %REINFORCE% <i class="xwing-miniatures-font xwing-miniatures-font-linked"></i> %CALCULATE%. %LINEBREAK% Before you engage, you may spend 1 or more %ENERGY% to flip that many of your <strong>Offline</strong> upgrade cards.%LINEBREAK% Action: Spend 1 or more %ENERGY% to repair that many of your faceup <strong>Ship</strong> damage cards."""
        "Ordnance Team":
           display_name: """Ordnance Team"""
           text: """Adds %RELOAD% <i class="xwing-miniatures-font xwing-miniatures-font-linked"></i> %CALCULATE%. %LINEBREAK% While you perform a %RELOAD% action, you may spend up to 3 %ENERGY% to reload that many additional %CHARGE% on your equipped %MISSILE%/%TORPEDO% upgrades. %LINEBREAK% After you perform a %RELOAD% action, you may spend 1 %ENERGY% to remove 1 disarm token."""
        "Sensor Experts":
           display_name: """Sensor Experts"""
           text: """Adds %LOCK% <i class="xwing-miniatures-font xwing-miniatures-font-linked"></i> %CALCULATE%. %LINEBREAK% You can maintain up to 3 locks on different objects. %LINEBREAK% After you perform a %LOCK% action, you may spend up to 2 %ENERGY% to acquire a lock on that many other objects at range 0-1 of the object you locked, ignoring range restrictions."""
        "Quick-Release Locks":
           display_name: """Quick-Release Locks"""
           text: """During the System Phase, you may spend 1 %CHARGE% to drop 1 cargo crate drift using the [2 %BANKLEFT%], [2 %STRAIGHT%], or [2 %BANKRIGHT%] template. %LINEBREAK% This card's %CHARGE% cannot be recovered."""
        "Saboteur's Map":
           display_name: """Saboteur's Map"""
           text: """At the end of Setup, you may spend up to 1 %CHARGE% from each of your equipped <strong>Mine</strong> upgrades to place the corresponding device in the play area beyond range 2 of any enemy ship, strategic marker, or other device."""
        "Scanner Baffler":
           display_name: """Scanner Baffler"""
           text: """At the end of Setup, you may choose any number of other friendly, non-huge ships in your deployment area at range 0-1. If you do, place those ships anywhere in the same deployment area."""
        "Adaptive Shields":
           display_name: """Adaptive Shields"""
           text: """While another friendly ship at range 0-1 defends, if it is a smaller size than you, you may spend 1 shield or 2 %ENERGY% to cancel 1 %HIT% or %CRIT% result."""
        "Boosted Scanners":
           display_name: """Boosted Scanners"""
           text: """While you lock, coordinate, or jam, you may spend up to 3 %ENERGY% to increase the range at which you can choose an object by 1 per %ENERGY% spent this way, to a maximum of range 5."""
        "Optimized Power Core":
           display_name: """Optimized Power Core"""
           text: """After you execute a blue maneuver, recover 1 %ENERGY%."""
        "Tibanna Reserves":
           display_name: """Tibanna Reserves"""
           text: """Action: Spend 1 %CHARGE% to recover 2 %ENERGY%."""
        "Toryn Farr":
           display_name: """Toryn Farr"""
           text: """<i>Adds %LOCK% <i class="xwing-miniatures-font xwing-miniatures-font-linked"></i> <r>%COORDINATE%</r> %LINEBREAK%After you coordinate a friendly ship, it may acquire a lock on a ship you are locking, ignoring range restrictions."""
        "Dodonna's Pride":
           display_name: """Dodonna's Pride"""
           text: """<i>Adds %EVADE% <i class="xwing-miniatures-font xwing-miniatures-font-linked"></i> <r>%COORDINATE%</r>, %FOCUS% <i class="xwing-miniatures-font xwing-miniatures-font-linked"></i> <r>%COORDINATE%</r> %LINEBREAK% Removes 2 shields</i> %LINEBREAK% Adds %TEAM% and %CARGO% slots."""
        "Jaina's Light":
           display_name: """Jaina's Light"""
           text: """<i>Adds 1 shield. Removes 1 energy. %LINEBREAK%</i> While a friendly ship at range 0-2 defends, if the attack is obstructed by an obstacle, you may spend 1 %ENERGY%. If you do, the defender rolls 1 additional defense die."""
        "Liberator":
           display_name: """Liberator"""
           text: """<i>Adds 1 energy. %LINEBREAK%</i>You can dock up to 2 small ships. %LINEBREAK% After a ship deploys from you, it may perform a %FOCUS% or %BARRELROLL% action."""
        "Tantive IV":
           display_name: """Tantive IV"""
           text: """Add 2 %CREW% slots. %LINEBREAK% While you defend, if the attacker is in your %REARARC%, you may roll 1 additional defense die."""
        "Thunderstrike":
           display_name: """Thunderstrike"""
           text: """<i>Adds 3 hull. Removes 3 shields. %LINEBREAK%</i> Adds %GUNNER% slot. %LINEBREAK% While you perform a bonus attack, if you have not attacked the defender this round, you may reroll 1 attack die."""
        "Bright Hope":
           display_name: """Bright Hope"""
           text: """You can reinforce only your %FULLFRONTARC%. %LINEBREAK% While you defend, if you are reinforced and the attacker is in your %FULLFRONTARC%, you may roll 1 additional defense die."""
        "Luminous":
           display_name: """Luminous"""
           text: """<i>Adds 2 energy. Removes 1 shield. %LINEBREAK%</i>Setup: You are placed in reserve. %LINEBREAK% At the end of setup, you are placed in the play area at range 0-2 of a friendly ship."""
        "Quantum Storm":
           display_name: """Quantum Storm"""
           text: """<i>Adds 1 energy. %LINEBREAK%</i>Adds %TEAM% and %CARGO% slots. %LINEBREAK% After you fully execute a white maneuver, recover 1 %ENERGY%."""
        "Assailer":
           display_name: """Assailer"""
           text: """<i>Adds 2 hull. Removes 2 shields. %LINEBREAK%</i> Adds %GUNNER% slot. %LINEBREAK% While you defend, if the attack range is 1, you may roll 1 additional defense die."""
        "Corvus":
           display_name: """Corvus"""
           text: """You can dock up to 2 small ships. %LINEBREAK% After you perform a %CALCULATE% action, gain 1 calculate token."""
        "Impetuous":
           display_name: """Impetuous"""
           text: """<i>Adds 2 energy. Removes 2 shields. %LINEBREAK%</i> Adds %CREW% slot. %LINEBREAK% After you perform an attack, if the defender was destroyed, you may perform a %FOCUS% or %LOCK% action."""
        "Instigator":
           display_name: """Instigator"""
           text: """Adds %TEAM% slot. %LINEBREAK% While you perform an attack, if the defender has an orange or red token, you may reroll up to 2 attack dice."""
        "Blood Crow":
           display_name: """Blood Crow"""
           text: """<i>Adds 2 energy. Removes 1 shield. %LINEBREAK%</i> Adds %GUNNER% slot. %LINEBREAK% While you perform an attack at attack range 1-2, you may add 1 %FOCUS% result."""
        "Requiem":
           display_name: """Requiem"""
           text: """<i>Adds 1 energy. Removes 1 hull. %LINEBREAK%</i> After a ship deploys from you, it may acquire a lock on one ship you are locking, ignoring range restrictions."""
        "Suppressor":
           display_name: """Suppressor"""
           text: """<i>Adds 2 shields. Removes 2 hull. %LINEBREAK%</i> Adds %SENSOR% slot. %LINEBREAK% After you coordinate a friendly ship, you may spend 1 %ENERGY% to jam an enemy ship at range 0-2 of that ship, ignoring range restrictions."""
        "Vector":
           display_name: """Vector"""
           text: """Adds %CREW% and %CARGO% slots. %LINEBREAK% After a ship deploys from you, it may perform a %EVADE% or %BOOST% action."""
        "Broken Horn":
           display_name: """Broken Horn"""
           text: """Adds %CREW% and %ILLICIT% slots. %LINEBREAK% If you are damaged, reduce the difficulty of your speed 3-5 maneuvers."""
        "Merchant One":
           display_name: """Merchant One"""
           text: """Adds %TURRET%, %TEAM%, and %CARGO% slots. %LINEBREAK% Bonus Attack: Perform a %TURRET% attack."""
        "Insatiable Worrt":
           display_name: """Insatiable Worrt"""
           text: """<i>Adds 3 hull. Removes 1 shield and 1 energy. %LINEBREAK%</i> Adds %CARGO% slot. %LINEBREAK% During the End Phase, you may recover 1 additional shield or 1 additional %ENERGY%."""
        "Corsair Refit":
           display_name: """Corsair Refit"""
           text: """<i>Adds 2 hull and 1 energy. Removes 2 shields. %LINEBREAK%</i> Adds %CANNON%, %TURRET%, and %MISSILE% slots. %LINEBREAK% Bonus Attack: Spend 1 %ENERGY% to perform a %CANNON%, %TURRET%, or %MISSILE% attack."""
            
            
        
    condition_translations =
        'Suppressive Fire':
           text: '''While you perform an attack against a ship other than <strong>Captain Rex</strong>, roll 1 fewer attack die. %LINEBREAK% After <strong>Captain Rex</strong> defends, remove this card.  %LINEBREAK% At the end of the Combat Phase, if <strong>Captain Rex</strong> did not perform an attack this phase, remove this card. %LINEBREAK% After <strong>Captain Rex</strong> is destroyed, remove this card.'''
        'Hunted':
           text: '''After you are destroyed, you must choose another friendly ship and assign this condition to it, if able.'''
        'Listening Device':
           text: '''During the System Phase, if an enemy ship with the <strong>Informant</strong> upgrade is at range 0-2, flip your dial faceup.'''
        'Rattled':
           text: '''After a bomb or mine at range 0-1 detonates, suffer 1 %CRIT%. Then, remove this card. %LINEBREAK% Action: If there are no bombs or mines at range 0-1, remove this card.'''
        'Optimized Prototype':
           text: '''While you perform a %FRONTARC% primary attack against a ship locked by a friendly ship with the <strong>Director Krennic</strong> upgrade, you may spend 1 %HIT%/%CRIT%/%FOCUS% result. If you do, choose one: the defender loses 1 shield or the defender flips 1 of its facedown damage cards.'''
        '''I'll Show You the Dark Side''': 
           text: ''' When this card is assigned, if there is no faceup damage card on it, the player who assigned it searches the damage deck for 1 Pilot damage card and places it faceup on this card. Then shuffle the damage deck. When you would suffer 1 %CRIT% damage, you are instead dealt the faceup damage card on this card. Then, remove this card. '''
        'Proton Bomb':
           text: '''(Bomb Token) - At the end of the Activation Phase, this device detonates. When this device detonates, each ship and remote at range 0–1 suffers 1 %CRIT% damage.%LINEBREAK%<i>Errata (Official Rulings Thread 03/2019): Added: "and remote"</i>'''
        'Seismic Charge':
           text: '''(Bomb Token) - At the end of the Activation Phase this device detonates. When this device detonates, choose 1 obstacle at range 0–1. Each ship and remote at range 0–1 of the obstacle suffers 1 %HIT% damage. Then remove that obstacle.%LINEBREAK%<i>Errata (Official Rulings Thread 03/2019): Added: "and remote"</i> '''
        'Bomblet':
           text: '''(Bomb Token) - At the end of the Activation Phase this device detonates. When this device detonates, each ship and remote at range 0–1 rolls 2 attack dice. Each ship and remote suffers 1 %HIT% damage for each %HIT%/%CRIT% result.%LINEBREAK%<i>Errata (Official Rulings Thread 03/2019): Added: "and remote"</i>'''
        'Loose Cargo':
           text: '''(Debris Token) - Loose cargo is a debris cloud.'''
        'Conner Net':
           text: '''(Mine Token) - After a ship overlaps or moves through this device, it detonates. When this device detonates, the ship suffers 1 %HIT% damage and gains 3 ion tokens.'''
        'Proximity Mine':
           text: '''(Mine Token) - After a ship overlaps or moves through this device, it detonates. When this device detonates, that ship rolls 2 attack dice. That ship then suffers 1 %HIT% plus 1 %HIT%/%CRIT% damage for each matching result.%LINEBREAK%<i>Errata (since rules reference 1.0.2): Added: "1 %HIT% plus"</i>'''
        'DRK-1 Probe Droid':
           text: '''INIT: 0 <br>AGILITY: 3 <br>HULL: 1 %LINEBREAK% (Remote) - <strong>System Phase:</strong> The DRK-1 probe droid’s controlling player may choose a [2 %BANKLEFT%], [2 %STRAIGHT%] or [2 %BANKRIGHT%] template and any set of the DRK-1’s guides. The player then relocates the remote, placing the DRK-1 at the other end of the template. It can be placed overlapping an object this way. %LINEBREAK%If the DRK-1 overlaps a ship, use the position marker to denote the ship’s position, then place the ship on top of the remote. %LINEBREAK%<strong>Activation, Engagement, and End Phase:</strong> No effect. %LINEBREAK%<strong>Other Rules:</strong> While a ship locks an object or jams an enemy ship, it may measure range from a friendly DRK-1 probe droid. After an enemy ship executes a maneuver that causes it to overlap a DRK-1 probe droid, the ship’s controller rolls 1 attack die. On a %FOCUS% result, the DRK-1 probe droid suffers 1 %HIT% damage.'''
        'Buzz Droid Swarm':
           text: '''INIT: 0 <br>AGILITY: 3 <br>HULL: 1 %LINEBREAK% (Remote) - <strong>System, Activation, and End Phase:</strong> No effect. %LINEBREAK%<strong>Engagement Phase:</strong> When you engage, each enemy ship at range 0 of the buzz droid swarm suffers 1 %CRIT% damage. %LINEBREAK%<strong>Other Rules:</strong> After an enemy ship overlaps or moves through a buzz droid swarm, the swarm’s controlling player relocates it by aligning the tab to that ship’s front or rear guides (this ship is at range 0 of the swarm). The swarm cannot be aligned to a set of the ship’s guides if doing so would cause it to overlap an object. If the swarm cannot be placed at a chosen set of guides, its controlling player must align it to the other set of the ship’s guides. If it cannot be aligned to the other set, the swarm and the enemy ship that overlapped or moved through it each suffer 1 %HIT% damage.'''
        '''It's the Resistance''':
           text: '''<strong>Setup:</strong> Start in reserve. %LINEBREAK% When you deploy, you are placed within range 1 of any table edge and beyond range 3 of any enemy ship. %LINEBREAK% At the start of the round, if all of the friendly <strong>GA-97</strong>'s %CHARGE% are active, you <strong>must</strong> deploy. Then remove this card. After the friendly <strong>GA-97</strong> is destroyed, you <strong>must</strong> deploy. Then gain 1 disarm token and remove this card.'''
        'Electro-Proton Bomb':
           text: '''(Bomb Token) - At the end of the Activation Phase this device detonates. When this device detonates, each ship and remote at range 0–2 rolls 4 attack dice. Each ship loses 1 shield for each blank result, gains 1 ion token for each %FOCUS%/%HIT% result, and gains 1 disarm token for each %CRIT% result. Each remote at range 0–1 loses 1 shield for each blank result and suffers 1 damage for each %FOCUS%/%HIT% result.'''
        'Decoyed':
           text: '''While you defend, each friendly <strong>Naboo Handmaiden</strong> in the attack arc may spend 1 evade token to change one of your results to an %EVADE% result. %LINEBREAK% If you are a Naboo Royal N-1 Starfighter, each friendly <strong>Naboo Handmaiden</strong> in the attack arc may spend 1 evade token to add 1 %EVADE% result instead.'''
        'Compromising Intel':
           text: '''During the System Phase, if the enemy <strong>Vi Morandi</strong> is at range 0-3, flip your dial faceup. %LINEBREAK% While you defend or perform an attack against the enemy <strong>Vi Morandi</strong>, you cannot spend focus tokens.'''
        'Cluster Mine':
           text: '''(Mine Tokens) - A Cluster Mine Set consists of 3 individual Cluster Mine devices. %LINEBREAK% When a Cluster Mines set is placed, the center Cluster Mine is placed as normal, then two additional Cluster Mines are placed in the recesses as shown. After a ship overlaps or moves through any individual Cluster Mine, it detonates. Other Cluster Mines in the set that were not overlapped or moved through do not detonate. %LINEBREAK% When each of these devices detonates, that ship rolls 2 attack dice. That ship then suffers 1 %HIT%/%CRIT% damage for each matching result.'''
        'Ion Bomb':
           text: '''(Bomb Token) - At the end of the Activation Phase, this device detonates. When this device detonates, each ship at range 0–1 gains 3 ion tokens, and each remote at range 0–1 suffers 1 %HIT% damage.'''
            
    exportObj.setupTranslationCardData pilot_translations, upgrade_translations, condition_translations

# This must be loaded before any of the card language modules!
exportObj = exports ? this

# Returns an independent copy of the data which can be modified by translation modules.
exportObj.rulesEntries = ->
    version:
        number: "1.1.0"
        date: "1/15/20"
    glossary:
        "ABILITIES":
            name: "Abilities"
            text: """Some of the text on condition, damage, ship, and upgrade cards describe <strong>abilities</strong>. These abilities consist of a timing and an effect.<br> • Unless a card ability uses the word “may” or has the <strong>“Action:”</strong> or <strong>“Attack:”</strong> headers, the ability is mandatory and must be resolved. <br> • A ship cannot spend or remove tokens that belong to another ship unless an effect explicitly states otherwise. Similarly, a ship cannot spend, modify, or remove die results that belong to another ship unless an effect explicitly states otherwise.<br> • If multiple abilities resolve at the same time, the players use the ability queue to determine the order in which the abilities resolve. <br>• A destroyed ship’s abilities remain active until that ship is removed unless the ability specifies a different timing for the effect to end, such as “until the end of the Engagement Phase.” Such effects remain active until the end of the specified time.<br><br><h5>Pilot and Ship Abilities</h5>Some ship cards have abilities in addition to or instead of flavor text. All limited ships have unique, personalized pilot abilities instead of flavor text. Some ships have ship abilities on their ship cards listed below their pilot ability or flavor text. Ships of the same ship type all have the same ship ability.<br><br><h5>Replacement Effects</h5>Some abilities are substitutive in nature—they replace how an effect would normally resolve. These abilities use the words “would” and “instead.” <br>• Replacement effects are not added to the end of the ability queue as they are resolved at the timing of the effect they are replacing. <br>• When a replacement effect resolves, the replaced effect is treated as having not occurred. <br>◊ For example, Jyn Erso’s ability says “If a friendly ship at range 0–3 would gain a focus token, it may gain 1 evade token instead.” If this ability is used, an effect that triggers after a ship gains a focus token cannot trigger. <br>• If there are multiple replacement effects that could substitute for the same effect, only one effect can be substituted for the original effect. <br>◊ For example, a ship is about to gain a focus token and has both the ability “Before you would gain a focus token, gain an evade token instead” and the ability “Before you would gain a focus token, gain a calculate token instead.” Only one of those abilities could be resolved.<br><br><h5>Paying Costs</h5>A ship can pay a cost for an effect only if the effect can be resolved. <br>• For example, GNK “Gonk” Droid’s ability says “<strong>Action:</strong> Spend 1 %CHARGE% to recover 1 shield.” The ship cannot spend the charge if it has no inactive shields.<br> • Replacement effects can replace a cost that a ship would pay for an effect. If a cost is replaced in this way, the effect is still resolved."""
        "ABILITY QUEUE":
            name: "Ability Queue"
            text: """The <strong>ability queue</strong> is used to resolve the timing of multiple abilities that trigger during the same timing window. Abilities are resolved from the front of the queue to the back of the queue. These abilities are added to the back of the ability queue using the following rules:<br>1. If both players have abilities that triggered from the same event, the abilities are added to the ability queue in player order.<br> 2. If a player has multiple abilities that triggered from the same event, that player chooses the order that those abilities are added to the ability queue. <br>3. If resolving an effect from the ability queue triggers additional effects, they are added to the front of the ability queue using the above rules. <br>See Appendix for 2 examples of the ability queue.<br> • If there are game effects that share the same timing window as a player’s ability, the game effect is resolved first.<br> ◊ For example, if a ship performs a red barrel roll and the ship has an ability that triggers after it performs a barrel roll, the ship gains a stress token before the other ability is resolved.<br> • If an ability’s requirements are not met, it cannot be added to the ability queue. For example, at the start of the Engagement Phase, if a ship has an ability that requires it to be tractored, but that ship is not tractored, that ability cannot be added to the queue. The ship cannot add the ability to the queue even if another ability also added to the queue at the start of the Engagement Phase would cause that ship to become tractored upon its resolution. <br>• If a ship would be removed while there are one or more abilities in the queue, do not remove that ship until there are no abilities in the queue."""      
        "ACTIONS":
            name: "Actions"
            text: """Ships can perform actions, which thematically represent things a pilot can do, such as repositioning slightly or flying defensively. When a ship is instructed to perform an action, the ship can perform a <strong>standard action</strong>, which includes actions listed in that ship’s action bar, as well as abilities that have the <strong>“Action:”</strong> header on that ship’s condition, damage, ship, or upgrade cards. <br><br>• A ship cannot perform actions while stressed. <br>• Some upgrade cards have an action bar that lists one or more actions. <br>These actions are added to the ship’s action bar and therefore are standard actions that the ship can perform. <br>• Some ship and upgrade cards have a linked action bar which allows the ship to perform linked actions. <br>• Some actions can fail. <br>• Actions have three difficulties: white, red, or purple. White is the least difficult, then red, then purple. <br>◊ As a cost to attempt to perform a red action, a ship must gain 1 stress token. <br>◊ As a cost to attempt to perform a purple action, a ship must spend 1 %FORCE%. <br>◊ If a ship is instructed to perform an action, the action is white unless stated otherwise. <br>◊ If two or more effects would alter the color of an action from its default color (e.g. “treat the action as red” ), the action is treated as the most restrictive of those colors. <br>• There is no maximum limit to the number of actions a ship can perform over the course of a round, but a ship cannot perform the same action more than once during a single round, or perform an action it has failed this round. <br>◊ If a ship has multiple damage cards with the same name, each damage card’s ability is a different action. <br>◊ Some cards have multiple <strong>“Action:”</strong> headers, each of which indicates a different action. <br>◊ Game effects such as “gain 1 focus token,” “boost,” or “acquire a lock” are not actions, and a ship can resolve these game effects any number of times each round. Game effects such as “perform a %FOCUS% action,” “perform a %BOOST% action,” or “perform a %LOCK% action” are actions, and therefore each ship can perform each of these actions only once per round. <br>• During the Perform Action step of a ship’s activation, the ship may perform an action. <br>• A ship can choose not to perform an action during the Perform Action step or when granted an action."""
        "ACTIVATION PHASE":
            name: "Activation Phase"
            text: """The Activation Phase is the third phase of a round. During this phase, each ship <strong>activates</strong>, one at a time, starting with the ship with the lowest initiative and continuing in ascending order.<br><br>Each ship activates by resolving the following steps in order:<br><strong>1. Reveal Dial:</strong> The ship’s assigned dial is revealed by flipping it faceup and then placing it next to its ship card.<br><strong>2. Execute Maneuver:</strong> The ship executes the maneuver selected on the revealed dial.<br><strong>3. Perform Action:</strong> The ship may perform one action.<br><br>After all ships have activated, players proceed to the Engagement Phase.<br>• If a player has multiple ships with the same initiative value, that player activates them in any order—finishing the entire activation for one ship before activating another ship of the same initiative value.<br>• If multiple players have ships with the same initiative value, player order is used to determine the sequence. The first player activates all of their ships with that initiative value in any order, then the second player activates all of their ships with that initiative value in any order.<br>• When a ship activates, if it skips the Reveal Dial step, it cannot resolve any abilities that trigger after the ship reveals its dial.<br>• A stressed ship cannot execute red maneuvers or perform actions.<br>• If a stressed ship attempts to execute a red maneuver, the ship executes a white [%STRAIGHT% 2] maneuver instead."""
        "AGILITY":
            name: "Agility"
            text: """A ship’s agility is the green number on its ship card. This value indicates the number of defense dice the ship rolls while it defends.<br>• During an attack, a ship with an agility value of “0” can still roll additional defense dice granted by game effects such as the range bonus, the attack being obstructed by an obstacle, or other card abilities.<br>• Abilities or game effects that cause a ship to roll additional or fewer defense dice do not modify the agility value of the defender.<br>• All modifiers to agility are cumulative.<br>• After all modifiers have been applied, if the number of defense dice required for a roll is less than “0,” it is treated as “0.”<br>• After all modifiers have applied, if the number of defense dice required for a roll is greater than "6," it is treated as "6.""" 
        "ARC":
            name: "Arc"
            text: """An arc is an area formed between the lines created by extending hash marks or arc lines printed on a ship token to range 3. A ship is <strong>in</strong> an arc if any part of its base is inside that area.<br>• Arcs are measured beyond the base of ships. The portion of any object that lies beneath a ship is not in any of those ship’s arcs.<br><br><h5>Standard Arcs</h5>There are three types of <strong>standard arcs</strong> created from the crossed diagonal arc lines:<br><strong>1. Front arc (%FRONTARC%):</strong> This arc projects in the same direction that the ship is facing. Most ships have a primary %FRONTARC% weapon. Almost all %CANNON%, %TORPEDO%, and %MISSILE% weapons use this arc.<br><strong>2. Side arcs (%LEFTARC%, %RIGHTARC%):</strong> These arcs are on the left (%LEFTARC%) or right (%RIGHTARC%) side of ships.<br><strong>3. Rear arc (%REARARC%):</strong> This arc projects in the opposite direction that the ship is facing. Some ships have a primary %REARARC% weapon.<br><br><h5>Bullseye Arc</h5>Inside of the front arc, each ship has a bullseye arc.<br><strong>Bullseye arc (%BULLSEYEARC%):</strong> This arc is found inside the %FRONTARC%. If something is in a ship’s %BULLSEYEARC%, it is also in its %FRONTARC%.<br>• The %BULLSEYEARC% is the width and length of the range ruler.<br>• There is no intrinsic effect when a ship attacks a ship in its %BULLSEYEARC%, but card abilities may refer to it.<br><br><h5>Full Arcs</h5>There are two <strong>full arcs</strong> that use the midway line instead of the printed arc lines.<br><strong>1. Full front arc (%FULLFRONTARC%):</strong> This arc covers all of the area in front of the ship.<br>Some ships have primary %FULLFRONTARC% weapons.<br><strong>2. Full rear arc (%FULLREARARC%):</strong> This arc covers all of the area behind the ship. <br>Using the %FULLFRONTARC%, %FULLREARARC%, and extending the midway line to range 3, the following phrases are used to express specific spacial relationships between ships. <br><strong>• Behind:</strong> If ship A is in the %FULLREARARC% of ship B and ship A does not cross the midway line of ship B, then ship A is <strong>behind</strong> ship B. <br><strong>• In front of:</strong> If ship A is in the %FULLFRONTARC% of ship B and ship A does not cross the midway line of ship B, then ship A is <strong>in front of</strong> ship B.<br><strong>• Flanking:</strong> If ship A crosses the midway line of ship B, then ship A is <strong>flanking</strong> ship B.<br><br><h5>Turret Arcs</h5><br>Unlike other arcs, some weapons use turret arc indicators to select arcs.<br>There are two types of turret arc indicators: single turret (%SINGLETURRETARC%) and double turret (%DOUBLETURRETARC%). During setup, a ship with a primary (or special) %SINGLETURRETARC% or %DOUBLETURRETARC% weapon adds the corresponding turret arc indicator to its base. <br>The turret arc indicator points toward one of the ship’s four standard arcs. <br>The standard arc that the turret arc indicator is pointing toward is a %SINGLETURRETARC% in addition to still being a standard arc. While a ship performs a %SINGLETURRETARC% attack, it can attack a target that is in its %SINGLETURRETARC% arc. <br>A ship with a double turret arc indicator has two %SINGLETURRETARC% in opposite directions. <br>A ship can adjust which standard arc(s) that its turret arc indicator is pointing towards by using the rotate (%ROTATEARC%) action. <br>Huge ships have additional rules for turret arc indicators (see Appendix: Huge Ships). <br><br><h5>Firing Arcs</h5> A ship’s <strong>firing arcs</strong> include all shaded arcs on the ship’s ship token plus all %SINGLETURRETARC% arcs, if any. <br>• If an upgrade card gives a ship a %SINGLETURRETARC% arc or primary weapon with a specified arc, those arcs are also firing arcs."""
        "ATTACK":
            name: "Attack"
            text: """Ships can perform attacks which thematically represents the ship firing its blaster cannons, ordnance, or other weapons. <br>If a ship performs an attack, it becomes the attacker then follows these steps: <br><br><strong>1. Declare Target:</strong> During this step, the attacking player identifies and names the defender of the attack. <br>a. <strong>Measure Range:</strong> The attacking player measures range from the attacker to any number of enemy ships and determines which enemy ships are in which of its arcs. <br>b. <strong>Choose Weapon:</strong> The attacking player chooses one of the attacker’s primary or special weapons. <br>c. <strong>Declare Defender:</strong> The attacking player chooses an enemy ship to be the defender. The defender must meet the requirements defined by the weapon. <br>d. <strong>Pay Costs:</strong> The attacker must pay any costs for performing the attack. <br><br>• During the Declare Target step, the attack arc is the arc that corresponds to the chosen weapon. The attack range is determined by measuring range from the closest point of the attacker to the closest point of the defender that is in the attack arc. <br>• A primary weapon requires the attack range to be range 1–3. A primary weapon has no cost by default. <br>• Special weapons have different requirements specified by the source of the attack. <br>• A ship cannot attack a ship at range 0, even if the attack range would be range 1. <br>• If there is no valid target for the chosen weapon, or if the attacker cannot pay the costs required for the attack, the attacking player either chooses a different weapon or chooses not to attack. <br><br><strong>2. Attack Dice:</strong> During this step, the attacking player rolls attack dice and the players can modify the dice. <br>a. <strong>Roll Attack Dice:</strong> The attacking player determines the number of attack dice to roll. Starting with the attack value, modifiers that increase or decrease the number of attack dice (such as range bonus and other effects) are applied. Next, if any minimum or maximum number of dice has been set, that limit is applied. There is always a minimum of 0 and a maximum of 6. Then they roll that many dice. <br>b. <strong>Modify Attack Dice:</strong> The players resolve abilities that modify the attack dice. The defending player resolves their abilities first, then the attacking player resolves their abilities. <br><br>• The most common ways the attacker modifies attack dice are by spending a focus token or spending a lock it has on the defender. <br>• Each attack die cannot be rerolled more than once during an attack. <br><br><strong>3. Defense Dice:</strong> During this step, the defending player rolls a number of defense dice equal to the ship’s agility value and the players can modify the dice. <br>a. <strong>Roll Defense Dice:</strong> The defending player determines a number of defense dice to roll. Starting with the defender’s agility value, modifiers that increase or decrease the number of defense dice (such as range bonus, whether the attack is being obstructed by an obstacle, and other effects) are applied. Next, if any minimum or maximum number of dice has been set, that limit is applied. There is always a minimum of 0 and a maximum of 6. Then they roll that many dice. <br>b. <strong>Modify Defense Dice:</strong> The players resolve abilities that modify the defense dice. The attacking player resolves their abilities first, then the defending player resolves their abilities. <br><br>• The most common ways the defender modifies defense dice are by spending a focus or evade token. <br>• Each defense die cannot be rerolled more than once during an attack. <br><br><strong>4. Neutralize Results:</strong> During this step, pairs of attack and defense dice <strong>neutralize</strong> each other. Dice are neutralized in the following order: <br>a. Pairs of %EVADE% and %HIT% results are canceled. <br>b. Pairs of %EVADE% and %CRIT% results are canceled. <br>The attack hits if at least one %HIT% or %CRIT% result remains uncanceled; otherwise, the attack misses. <br><br><strong>5. Deal Damage:</strong> If the attack hits, the defender suffers damage for each uncanceled %HIT% and %CRIT% result in the following order: <br>a. The defender suffers 1 %HIT% damage for each uncanceled %HIT% result. Then cancel all %HIT% results. <br>b. The defender suffers 1 %CRIT% damage for each uncanceled %CRIT% result. Then cancel all %CRIT% results. <br><br><strong>6. Aftermath:</strong> Abilities that trigger after an attack are resolved in the following order. <br>a. Resolve any of the defending player’s abilities that trigger after a ship defends or is destroyed, excluding abilities that grant a bonus attack. <br>b. Resolve any of the attacking player’s abilities that trigger after a ship performs an attack or is destroyed, excluding abilities that grant a bonus attack. <br>c. Resolve any of the defending player’s abilities that trigger after a ship defends or is destroyed that grant a bonus attack. <br>d. Resolve any of the attacking player’s abilities that trigger after a ship performs an attack or is destroyed that grant a bonus attack. <br><br>• Each ship may perform one standard attack when it engages during the Engagement Phase. <br>• If a ship is destroyed at an initiative step during the Engagement Phase, the ship is not removed until all ships of the attacker’s initiative have engaged. <br>• During an attack, a ship cannot choose to roll fewer dice than it is supposed to roll. <br>• If a player would roll more dice than they have available, keep track of the rolled results and reroll the dice necessary to equal the total number of dice the player would have rolled all at once. Note that these dice are not considered rerolled for the purposes of modifying dice.""" 
        "ATTACK ARC":
            name: "Attack Arc"
            text: """During an attack, the <strong>attack arc</strong> is the arc that corresponds to the weapon the attacker is using. During the Declare Defender step, the opposing ship needs to be in the attack arc."""
        "ATTACK RANGE":
            name: "Attack Range"
            text: """During an attack, the <strong>attack range</strong> is determined by measuring range from the closest point of the attacker to the closest point of the defender that is in the attack arc.<br>• While measuring range for abilities that do not specify the attack range, the range between the attacker and defender is measured from the closest point of the attacker to the closest point of the defender, ignoring the attack arc."""
        "BANK":
            name: "Bank"
            text: """See Bearing."""
        "BARREL ROLL":
            name: "Barrel Roll"
            text: """Pilots can barrel roll to move their ship laterally and adjust their position. When a small ship performs a %BARRELROLL% action, it barrel rolls by following these steps:<br>1. Take the [1 %STRAIGHT%] template.<br>2. Place the narrow edge of the template flush against the left or right side of the ship’s base. The template must be placed with the middle line of the template aligned with the hashmark on the side of the base. <br>3. Lift the ship off the play surface, then place the ship with the hashmark on the side of the base aligned to the front, middle, or back of the other narrow end of the template. <br>4. Return the template to the supply. <br><br>When a medium or large ship barrel rolls, substitute “long edge” for “narrow edge” in the above description. <br><br>• When a player declares to barrel roll a ship, that player also declares whether the ship is barrel rolling to the left or right. Then, while attempting to place the ship, the player may attempt to place the ship at the front, middle, and back before choosing one of those positions. <br>• While attempting to place a ship to complete a barrel roll, the barrel roll can fail if any of the following occurs: <br>◊ All three positions would cause the ship to overlap another ship. <br>◊ All three positions would cause the ship to overlap or move through an obstacle. <br>◊ All three positions would cause the ship to be outside the play area (and therefore would cause that ship to flee). <br>• If a barrel roll fails, the ship is returned to its prior position before it attempted the barrel roll. If this was part of a %BARRELROLL% action, that action fails. <br>• The player cannot choose to fail a barrel roll if one of the three positions would not cause the action to fail. <br>• Performing a barrel roll does not count as executing a maneuver but does count as a move. <br>• If an ability instructs a ship to barrel roll, this is different than performing a %BARRELROLL% action. A ship that barrel rolls without performing the action can still perform the %BARRELROLL% action this round."""
        "BEARING":
            name: "Bearing"
            text: """Each maneuver has three components: speed (a number 0–5), difficulty (red, white, or blue), and bearing (an arrow or other symbol). Each bearing is also defined with a <strong>direction</strong>, including straight, left, or right. <br>All maneuvers are categorized as either basic or advanced. Additionally, all maneuvers that begin by using the front guides are <strong>forward</strong> maneuvers.<br><br><h5>Basic Maneuvers</h5>The following bearings are for basic maneuvers. These maneuvers follow the standard rules for executing a maneuver. <br><strong>• Straight:</strong> The %STRAIGHT% (straight) bearing advances a ship straight forward. <br><strong>• Bank:</strong> The %BANKLEFT% (left bank) and %BANKRIGHT% (right bank) bearings advance a ship at a shallow curve to one side, changing its facing by 45º. <br><strong>• Turn:</strong> The %TURNLEFT% (left turn) and %TURNRIGHT% (right turn) bearings advance a ship at a tight curve to one side, changing its facing by 90º. <br><br><h5>Advanced Maneuvers</h5> The following bearings are for <strong>advanced maneuvers</strong>. These have exceptions to the standard rules for executing a maneuver. <br><strong>• Koiogran Turn:</strong> The %UTURN% (Koiogran turn) bearing advances a ship straight forward, changing its facing by 180º. This uses the same template as the %STRAIGHT% maneuver. <br>◊ If the ship fully executes the maneuver, the player slides the ship’s front guides into the end of the template instead of the rear guides. <br><strong>• Segnor’s Loop:</strong> The %SLOOPLEFT% (left Segnor’s Loop) and %SLOOPRIGHT% (right Segnor’s Loop) bearings advance a ship at a shallow curve to one side, then reverses its facing. This uses the same template as the %BANKLEFT% and %BANKRIGHT% maneuvers. <br>◊ If the ship fully executes the maneuver, the player slides the ship’s front guides into the end of the template instead of the rear guides. <br><strong>• Tallon Roll:</strong> The %TROLLLEFT% (left Tallon Roll) and %TROLLRIGHT% (right Tallon Roll) bearings advance a ship at a tight curve to one side, sharply changing its facing by 180º. This uses the same template as the %TROLLLEFT% and %TROLLRIGHT% maneuvers. <br>◊ If the ship fully executes the maneuver, before the player places the ship at the opposite end of the template, the ship is rotated 90º to the left for a %TURNLEFT%, or 90º to the right for a %TURNRIGHT%. Then the player places the ship with the hashmark on the side of the base aligned to the left, middle, or right of the end of the template, (similar to a barrel roll). <br><br>If a ship overlaps another ship while executing a Koiogran turn, Segnor’s Loop, or Tallon Roll, the ship partially executes the maneuver by using the rear guides as though it was executing the basic maneuver that uses the same template. <br><br><strong>• Stationary:</strong> The %STOP% (stationary) bearing does not move the ship from its current position. This bearing does not have a corresponding template. <br>◊ A ship that executes this maneuver counts as executing a maneuver, does not overlap any ships, does trigger the effects of overlapping any obstacles at range 0, and continues to be at range 0 of any objects it was touching before executing this maneuver. <br>◊ Stationary maneuvers are not forward maneuvers. <br>◊ A ship that executes a stationary maneuver always fully executes the maneuver. <br><br>At the start of any type of <strong>reverse</strong> maneuver, instead of sliding the template between the front guides of the ship’s base, slide it between the rear guides. Additionally, when the ship is moved, the player slides the ship’s front guides into the end of the template instead of the rear guides. <br><br><strong>• Reverse Straight:</strong> The %REVERSESTRAIGHT% (reverse straight) bearing moves the ship straight backward. This bearing uses the same template as the %STRAIGHT% maneuver. <br>◊ Reverse straight maneuvers are reverse maneuvers, not forward maneuvers. <br><strong>• Reverse Bank:</strong> The %REVERSEBANKLEFT% ( left reverse bank) and %REVERSEBANKRIGHT% (right reverse bank) bearing moves the ship at a shallow curve to one side, changing its facing by 45º. This bearing uses the same template as the %BANKLEFT% and %BANKRIGHT% maneuvers. <br>◊ Reverse bank maneuvers are reverse maneuvers, not forward maneuvers. """
        "BEHIND":
            name: "Behind"
            text: """See Arc."""
        "BONUS ATTACK":
            name: "Bonus Attack"
            text: """If a card instructs a ship to perform a bonus attack, it performs an additional attack during the Aftermath step. <br>• A few special weapons provide a bonus attack using the same weapon. While performing this type of bonus attack, the same arc requirements, range requirements, and cost requirements are followed unless stated otherwise. <br>◊ For example, a ship that attacked with the Cluster Missiles card can perform a bonus attack against another ship at range 1 of the defender and ignore the %LOCK% requirement. The range (1–2), arc (%FRONTARC%), and cost (spending 1 %CHARGE% charge) are maintained for the bonus attack. <br>• A ship can perform only one bonus attack per round. <br>• If both players have a bonus attack that triggers after an attack, the defending player resolves their bonus attack first. <br>• Huge ships have additional rules for bonus attacks. See Appendix: Huge Ships. """
        "BOMB":
            name: "Bomb"
            text: """A bomb is a type of device that is placed in the play area through a card effect from a %DEVICE% upgrade card. The upgrade card that corresponds to the bomb has the “Bomb” trait at the top of its card text. Bombs can be dropped or launched during the System Phase and detonate at the end of the Activation Phase. """
        "BOOST":
            name: "Boost"
            text: """Boost represents a pilot activating additional thrusters to move fartherforward. When a ship performs a %BOOST% action, it boosts by following these steps: <br>1. Choose the [1 %BANKLEFT%], [1 %STRAIGHT%], or [1 %BANKRIGHT%] template. <br>2. Set the template between the ship’s front guides. <br>3. Place the ship at the opposite end of the template and slide the rear guides of the ship into the template. <br>4. Return the template to the supply. <br><br>• When a player declares to boost a ship, that player also declares whether the ship is boosting straight, left, or right. <br>• While attempting to place a ship to complete a boost, the boost can fail if any of the following occurs: <br>◊ The ship’s final positions would cause the ship to overlap another ship. <br>◊ The ship would overlap or move through an obstacle. <br>◊ The ship’s final position would cause it to be outside the play area (and therefore would cause that ship to flee). <br><br>• If a boost fails, the ship is returned to its prior position before it attempted the boost. If this was part of a %BOOST% action, that action fails. <br>• The player cannot choose to fail a boost if the final position would not cause the action to fail. <br>• Performing a boost does not count as executing a maneuver but does count as a move. <br>• If an ability instructs a ship to boost, this is different than performing a %BOOST% action. A ship that boosts without performing the action can still perform the %BOOST% action this round. """
        "BREAK":
            name: "Break"
            text: """See Lock."""
        "BULLSEYE ARC":
            name: "Bullseye Arc"
            text: """See Arc."""
        "CALCULATE":
            name: "Calculate"
            text: """Pilots can calculate, using advanced computing power to increase their combat performance. When a ship performs the %CALCULATE% action, it gains one calculate token. <br>A ship is <strong>calculating</strong> while it has at least one calculate token. Calculate tokens are circular, green tokens. A calculating ship follows these rules: <br>• While a calculating ship performs an attack, during the Modify Attack Dice step, it may spend one or more calculate tokens to change that many of its %FOCUS% results to %HIT% results. <br>• While a calculating ships defends, during the Modify Defense Dice step, it may spend one or more calculate tokens to change that many of its %FOCUS% results to %EVADE% results. <br><br>Additionally: <br>• A ship cannot spend calculate tokens to change %FOCUS% results to %HIT% or %EVADE% results if it does not have any %FOCUS% results. <br>• If a card ability instructs a ship to gain a calculate token, this is different than performing a %CALCULATE% action. A ship that gains the token without performing the action can still perform the %CALCULATE% action this round."""
        "CANCEL":
            name: "Cancel"
            text: """When a die result is canceled, a player takes one die displaying the canceled result and physically removes the die from the common area. Players ignore all canceled results. <br>• Canceling dice does not count as modifying dice."""
        "CHARGES":
            name: "Charges"
            text: """<strong>Charges</strong> are two-side punchboard components that track certain limited resources. Some ship and upgrade cards have charges to denote their use. <br><br>All charges obey the following rules: <br>• When an effect instructs a ship to <strong>recover</strong> a charge, an inactive charge on that ship (ship or upgrade card) is flipped to its active side. A card cannot recover a charge if all of its charges are on their active side. <br>• When an effect instructs a ship to <strong>lose</strong> a charge, a charge assigned to the relevant card is flipped to the inactive side. <br>• When a ship <strong>spends</strong> a charge, that charge is flipped to its inactive side. A ship cannot spend a charge for an effect if all of its charges that are available for that effect are already inactive. <br>• Each card with a <strong>charge limit</strong> (the number) starts the game with a number of charges equal to the charge limit. Each charge starts on its active side. <br>• Charges associated with charge limits that have the recurring charge symbol are called <strong>recurring charges</strong>. Alternatively, charges associated with charge limits that do not have the recurring charge symbol are called <strong>non-recurring charges</strong>.<br><br><h5>Charge Types</h5>There are four types of charges: <br>• Standard charges (%CHARGE%), which represent limited resources like munitions and a pilot's stamina. These have a golden number. <br>• Force charges (%FORCE%), which represent the ebbing and flowing power of the Force: These have a purple number. <br>• Shields (%SHIELD%), which represent a ship's defensive shielding. These have a blue number. <br>• Energy (%ENERGY%), which represents a huge ship's draw of power from its engines (see Appendix: Huge Ships). These have a magenta number.<br><br> <h5>Recurring Charges</h5> Some charge limits, shield capacities, and all Force capacities have a recurring charge symbol. During the End Phase, each card with a recurring charge symbol recovers one charge.<br><br> <h5>Standard Charge (%CHARGE%)</h5> Standard charges (%CHARGE%) can represent anything from limited munitions to exhaustible abilities that can only be performed infrequently. <br>• Ship charges are charges on ship cards and upgrade charges are charges on upgrade cards. <br>• If an upgrade card has a charge limit, the %CHARGE% are placed above that upgrade card (not the ship card it is attached to). <br>◊ If an upgrade card instructs the ship to spend %CHARGE%, those %CHARGE% are spent from that upgrade card. <h5>Force Charge (%FORCE%)</h5> Force charges (%FORCE%) represent how some pilots or crew members can exert their influence over the Force. <br>While it performs an attack, a ship can spend any number of %FORCE% during the Attack Dice step to change that number of its %FOCUS% results to %HIT% results. While it defends, a ship can spend any number of %FORCE% during the Defense Dice step to change that number of its %FOCUS% results to %EVADE% results. <br>• If an upgrade card has a Force capacity, this increases the Force capacity of the ship. The %FORCE% are placed above the ship card it is attached to (not the upgrade card). <br>◊ A ship card that does not have a Force capacity on its ship card has a Force capacity of “0,” but that capacity can be increased by upgrade cards that have a Force capacity. <br>◊ If a ship has multiple sources of recurring %FORCE%, the recurring values do not stack. During the End Phase, each ship with a Force capacity recovers a number of %FORCE% equal the highest number of recurring %FORCE% symbols among the cards that grant it a Force capacity. For example, if a ship with a Force capacity of "0" has two %CREW% cards that each grant it a Force capacity of "+1" and have one recurring %FORCE% symbol each, that ship has a Force capacity of "2," but recovers only one %FORCE% during the End Phase. <br>◊ If an upgrade card instructs the ship to spend %FORCE%, those %FORCE% are spent from the ship card. <br><br><h5>Shield (%SHIELD%)</h5> Shields (%SHIELD%) represent defensive energy barriers. A ship is shielded while it has at least one active shield. <br>While a ship defends, shields provide it protection against damage. See Damage. Additionally: <br>• If an upgrade card has a shield capacity, this increases the shield capacity of the ship. The %SHIELD% are placed above the ship card it is attached to (not the upgrade card). <br>◊ A ship card that does not have a shield capacity on its ship card has a shield capacity of “0,” but that capacity can be increased by upgrade cards that have a shield capacity. <br>◊ During the End Phase, each ship with a shield capacity recovers a number of %SHIELD% equal the number of recurring %SHIELD% symbols on its ship card (only huge ships have recurring %SHIELD% symbols, see Appendix: Huge Ships). <br>◊ If an upgrade card instructs the ship to spend %SHIELD%, those %SHIELD% are spent from the ship card. <br><br><h5>Energy (%ENERGY%)</h5> Energy (%ENERGY%) are special charges used only by huge ships (see Appendix: Huge Ships)."""
        "CLOAK":
            name: "Cloak"
            text: """Ships can cloak to become difficult to hit, and they can decloak to move unpredictably. When a ship performs the %CLOAK% action, it gains one cloak token. <br>A ship is cloaked while it has a cloak token. Cloak tokens are blue tokens. <br><br>A cloaked ship has the following effects: <br>• Its agility value is increased by 2. <br>• It is disarmed. <br>• It cannot perform the cloak action or gain a second cloak token. <br><br>During the System Phase, each cloaked ship may spend its cloak token to decloak. When a small ship decloaks, it must choose one of the following effects: <br>1. Barrel roll using the [2 %STRAIGHT%] template. <br>2. Boost using the [2 %STRAIGHT%] template. <br><br>When a medium or large ship decloaks, it must choose one of the following effects: <br>1. Barrel roll using the [1 %STRAIGHT%] template. <br>2. Boost using the [1 %STRAIGHT%] template. <br><br>• Decloaking does not count as executing a maneuver or performing an action but does count as a move. <br>• A ship can decloak even while stressed. <br>• When a player declares to decloak a ship, that player must declare which type of boost or barrel roll it is going to perform before placing a template on the play area. <br>• If a decloak fails, the ship is returned to its prior position before it attempted the decloak and the cloak token is not removed. <br>• Each ship cannot drop or launch a device during the same phase that it decloaked."""
        "CONDITION CARDS":
            name: "Condition Cards"
            text: """Condition cards are cards assigned by ship and upgrade cards that represent persistent game effects. A condition card is not in play until a game effect assigns it to a ship. When a condition card is assigned, its text resolves. <br><br>After a ship is assigned a condition card, assign the associated condition marker to that ship as a reminder of the card’s persistent effect. <br>• A condition marker is removed when the corresponding condition card is removed. <br>• A condition that has been removed can be assigned again. <br>• Some condition cards are limited. If an effect assigns a player’s limited condition that is already in play, the condition card is removed and then assigned. <br>• When a ship is removed from the game, any condition cards assigned to that ship are not removed."""
        "COORDINATE":
            name: "Coordinate"
            text: """Pilots can coordinate to assist their allies. When a ship performs the %COORDINATE% action, it coordinates. A <strong>coordinating</strong> ship is a ship that is attempting to coordinate by performing the following steps: <br>1. Measure range from the coordinating ship to any friendly ships. <br>2. Choose another friendly ship at range 1–2. <br>3. The chosen ship performs one action. <br><br>Additionally: <br>• While a ship coordinates, the coordinate fails if no friendly ship can be chosen. <br>◊ If the chosen ship attempts to perform an action but that action fails, the coordinate does not fail. <br>• If an ability instructs a ship to coordinate, this is different than performing a %COORDINATE% action. A ship that coordinates without performing the action can still perform the %COORDINATE% action this round."""
        "DAMAGE":
            name: "Damage"
            text: """Damage represents the amount of structural damage a ship can take. Damage is tracked by damage cards. A ship is destroyed when the number of damage cards it has is equal to or greater than its hull value. <br><br>There are two types of damage: %HIT% (regular) damage and %CRIT% (critical) damage. When a ship suffers damage, that damage is suffered one at a time. For each damage a ship suffers, it loses an %SHIELD% (active shield). If it does not have an %SHIELD% remaining, it is dealt a damage card instead. For %HIT% damage, the card is dealt <strong>facedown</strong>; for %CRIT% damage, the card is dealt <strong>faceup</strong> and its text is resolved. All %HIT% damage is suffered <strong>before</strong> %CRIT% damage. <br><br>A ship is <strong>damaged</strong> while it has at least one damage card. A ship is <strong>critically damaged</strong> while it has at least one faceup damage card. <br>• If an effect instructs a player to deal a damage card to a ship, this is different from the ship suffering damage. The card is dealt to the ship regardless of whether the ship has any %SHIELD% (active shields). <br>• When a ship suffers damage or otherwise is dealt damage cards that would cause it to exceed its hull value, the excess damage cards are still dealt."""
        "DAMAGE CARDS":
            name: "Damage Cards"
            text: """Damage cards are used to track how much damage a ship has suffered. When a ship needs to be dealt damage cards, the player uses their own damage deck. After a ship is destroyed, its damage cards remain on that ship. <br><br>Some abilities can cause damage cards to be flipped. A facedown damage card can be <strong>exposed</strong>, which flips it faceup and the effect is resolved. Both facedown and faceup damage cards can be <strong>repaired</strong>. If a faceup damage card is repaired, it is flipped facedown. If a facedown damage card is repaired, it is discarded. <br>• Exposing a damage card does not count as dealing a damage card and therefore does not trigger abilities related to suffering damage. <br>• If an ability exposes or repairs a ship’s facedown damage card, and the ship has multiple facedown damage cards, the card is chosen randomly from the facedown damage cards the ship has. <br>◊ To randomly select a facedown damage card, one player shuffles those cards and the other player chooses one. <br>• If an ability allows a ship to repair a damage card without specifying faceup or facedown, the player can choose to repair either type. <br>• A ship’s hull value is not reduced by being dealt damage cards. <br>• The text of a ship’s facedown damage cards cannot be looked at unless an effect specifies to do so. <br>• If a damage deck is empty when a damage card must be dealt or drawn, remove all damage cards from destroyed ships, flip them facedown, and shuffle them to create a new damage deck. <br>• Each damage card is numbered 1–14 on the bottom of the card. Near that number, there is a number of pips that indicate the number of copies of that damage card that are in the deck. This is useful to identify whether cards are missing and if so, how many and which cards. <br>• Huge ships have their own damage cards. See Appendix: Huge Ships."""
        "DECLOAK":
            name: "Decloak"
            text: """See Cloak."""
        "DEFEND":
            name: "Defend"
            text: """See Attack."""
        "DEFENDER":
            name: "Defender"
            text: """The ship that is chosen during the Declare Defender step of the Declare Target step of an attack is the defender. <br>• That ship remains the defender until after all “after attacking” and “after defending” abilities have resolved during the Aftermath step."""
        "DEPLETE":
            name: "Deplete"
            text: """A ship is depleted while it has at least one deplete token. While a depleted ship performs an attack, it rolls one fewer attack die. Deplete tokens are red tokens. <br>• After a depleted ship applies the effect to roll one fewer attack die this way, it removes one deplete token. <br>• After a depleted ship executes a blue maneuver, it removes one deplete token."""
        "DEPLOY":
            name: "Deploy"
            text: """See Dock."""
        "DESTROYING SHIPS":
            name: "Destroying Ships"
            text: """A ship is <strong>destroyed</strong> after it has a number of damage cards that equals or exceeds its hull value. A destroyed ship is placed on its ship card. <br>• After a ship is destroyed in a phase other than the Engagement Phase, it is removed from the game. <br>• If a ship is destroyed during the Engagement Phase, it is removed after all ships that have the same initiative as the currently engaged ship have engaged, which is called simultaneous fire <br>• If an effect triggers after a ship is destroyed, the effect resolves immediately, before the ship is removed. <br>• A destroyed ship’s abilities remain active until that ship is removed unless the ability specifies a different timing for the effect to end, such as “until the end of the Engagement Phase.” Such effects remain active until the end of the specified time."""
        "DEVICE":
            name: "Device"
            text: """Devices are objects that exist in the play area and are represented by cardboard markers. Certain cards allow a ship to add a specific type of device to the play area and provide additional rules for how that device behaves. There are a number of ways for a device to enter or change location in the play area. Some provide specific instructions for how to place a device in the play area, while others use one or more of the following processes: <br><br>To <strong>drop</strong> a device, follow the steps below: <br>1. Take the template indicated on the upgrade card. <br>2. Set the template between the ship’s rear guides. <br>3. Place the device indicated on the upgrade card into the play area and slide the guides of the device into the opposite end of the template. Then remove the template. <br><br>To <strong>launch</strong> a device, follow the steps below: <br>1. Take the template indicated on the upgrade card. <br>2. Set the template between the ship’s front guides. <br>3. Place the device indicated on the upgrade card into the play area and slide the guides of the device into the opposite end of the template. Then remove the template. <br><br>To <strong>relocate</strong> a device, do the following: <br>• Pick up and replace the device as described in the effect that relocated it. This can involve a template, or might place the device at a ship’s guides. <br>• A device that relocates does not count as moving through or overlapping obstacles. <br><br>Some devices can detonate. When a device <strong>detonates</strong>, an effect triggers depending on the type of device. <br>• See Appendix for examples of dropping and launching. <br>• One side of each device has a white boarder to help distinguish which player it belongs to. <br>• Most devices are placed during the System Phase. Each ship can place a device only once per System Phase. <br>• Most devices have an associated upgrade card that lets the player spend %CHARGE% to place that device. Many of these cards are payload (%DEVICE%) upgrades. <br>• When an effect instructs a ship to place a device associated with a different card (e.g. “drop 1 bomb”), that ship must pay all costs (such as spending %CHARGE%) and place the device as its associated card dictates. Other effects can modify how it is placed (e.g. the TIE Bomber’s Nimble Bomber ship ability) as normal. <br>• Each ship cannot place a device during the same phase that it decloaked. <br>• Devices are not obstacles but are objects. <br>• If a device is placed overlapping a ship, it is placed under the ship’s base. <br>• If a device that detonates when overlapped is placed under more than one ship’s base, it detonates instantly and the player placing the device chooses which ship it affects. <br>• The guides on a device count as part of the device for the purposes of measuring range to or from it as well as overlapping and moving through it. <br>• A device cannot be placed so that a portion of the device would be outside the play area. If this would happen, play is reversed to before the device was placed—the device is not placed, any charges spent are recovered, and the player can choose to not place that device. <br>• If a ship partially executes a maneuver, only the portion of the template that is between the starting and final position of the ship is counted for the purpose of moving through or overlapping a device. Ignore the portion of the template that the ship moved backward along when resolving the maneuver."""
        "DIAL":
            name: "Dial"
            text: """Each ship type has its own unique dial. All expansion products contain a dial for eachship in that product. Dials are used during the Planning Phase to secretly select maneuvers. <br>• When a player is instructed to set a ship’s dial, the player can choose the same maneuver that it already hasselected unless stated otherwise. <br>• Players are not allowed to touch or look at their opponents’ facedown dials. If a player wishes to touch or look at their own facedown dial, they must inform their opponent they wish to do so before touching the dial. <br>• Each faction has its own Maneuver Dial Upgrade Kit. These dials assemble slightly differently than the standard dials and use a curved indicator below the maneuver instead to indicate selected maneuvers."""
        "DICE MODIFICATION":
            name: "Dice Modification"
            text: """Players can modify dice by spending various tokens and by resolving abilities. Dice can be modified in the following ways:<br>• <strong>Add:</strong> To add a die result, place an unused die displaying the result next to the rolled dice. A die added in this way is treated as a normal die for all purposes and can be modified and canceled. <br>• <strong>Change:</strong> To change a die result, rotate the die so that its faceup side displays the new result. <br>• <strong>Reroll:</strong> To reroll a die result, pick up the die and roll it again. <br>• <strong>Spend:</strong> To spend a result, remove the die from the dice pool. <br><br>Additionally: <br>• Dice modification occurs during the respective Modify Attack Dice or Modify Defense Dice step, unless otherwise stated. <br>• Although dice can be modified by multiple effects, each die cannot be rerolled more than once. <br>• If an ability instructs a ship to spend a result, it cannot spend another ship’s results unless stated otherwise. <br>• Canceling dice is not a dice modification. <br>• Rolling additional dice or fewer dice is not a dice modification. <br>• If a die cannot be changed to a given result, nothing happens. <br>◊ For example, an attack die cannot be changed to an 󲁄 result because that result does not appear on that die."""
        "DIFFICULTY":
            name: "Difficulty"
            text: """Each maneuver has three components: speed (a number 0–5), difficulty (red, white, or blue), and bearing (an arrow or other symbol). <br><br>During the Check Difficulty step of executing a maneuver, if the maneuver is red, the ship gains one stress token; if the maneuver is blue, the ship removes one stress token. <br>• A stressed ship cannot execute red maneuvers or perform actions. <br>• If an effect increases the difficulty of a maneuver, blue increases to white, and white increases to red. If an effect decreases the difficulty of a maneuver, red decreases to white, and white decreases to blue. <br>◊ An ability that increases the difficulty of a red maneuver or decreases the difficulty of a blue maneuver can resolve, but has no additional effect. <br>◊ If multiple abilities change the difficulty of a maneuver, the effects are cumulative. For example, if a ship reveals a red [4 %STRAIGHT%] maneuver and has one effect that increases the difficulty of the maneuver and another effect that decreases the difficulty of the maneuver, the maneuver is treated as red."""
        "DIRECTION":
            name: "Direction"
            text: """See “Bearing”"""
        "DISARMED":
            name: "Disarmed"
            text: """A ship is <strong>disarmed</strong> if it has at least one disarm token. A disarmed ship cannot perform attacks. The disarm token is a circular, orange token and is removed during the End Phase. <br>• During the Engagement Phase, disarmed ships still engage (although they cannot perform attacks)."""
        "DOCK":
            name: "Dock"
            text: """Some abilities allow a ship to be attached to or ride inside another ship. If a card ability instructs a ship to <strong>dock</strong> with a carrier ship, the docked ship is placed in reserve. A docked ship is able to <strong>deploy</strong> from its carrier ship during the System Phase by performing the following steps: <br>1. Choose a non-stationary, non-reverse maneuver on the docked ship’s dial. <br>2. Using the corresponding template, the docked ship executes the maneuver using the front guides or the rear guides of the carrier ship as if those guides were the docked ship’s starting position. <br>3. The ship may perform one action. <br>• While a ship is deploying, if the ship would partially execute the maneuver and cannot be placed without overlapping another ship, the ship fails to deploy and stays in reserve. <br>• A ship that deploys during the System Phase does not activate during the Activation Phase. <br><br>During the System Phase, a ship at range 0 of its carrier ship can dock with it and be placed in reserve. A ship cannot both dock and deploy during the same System Phase. A ship that docks during the System Phase does not resolve its assigned dial or activate during the Activation Phase. <br><br>If a carrier ship is destroyed, before the carrier is removed from the play area, any docked ships can <strong>emergency deploy</strong> from their carrier. A docked ship performs an emergency deploy similar to deploying, as described above, except the ship first suffers 1 %CRIT% damage and after executing the maneuver, does not have the opportunity to perform an action. <br>• If the docked ship attempts to emergency deploy and must partially execute the maneuver but cannot be placed without overlapping another ship, the ship fails to deploy and is destroyed. <br>• If a ship emergency deploys during the Engagement Phase, it can still engage during that phase at its initiative. If its initiative has already occurred this round, it cannot engage this phase. <br><br>Additionally: <br>• See Appendix for a deploy example. <br>• Ships capable of docking can start the game docked. Before the Place Forces step of setup, that player must declare which ships are docked and the ships they are docked to. <br>• During the System Phase, the initiative of the ship docking or deploying is used, not the initiative of the carrier ship."""
        "DROP":
            name: "Drop"
            text: """See Device."""
        "END PHASE":
            name: "End Phase"
            text: """The End Phase is the fifth phase of the round. During the End Phase, all circular tokens are removed from all ships. Then, each card with a recurring charge icon recovers one charge. <br>• After this phase, the criteria for winning the game are checked. <br>• If the game did not end, the Planning Phase of the next round begins."""
        "ENEMY":
            name: "Enemy"
            text: """All ships/devices controlled by opposing players are enemy ships/devices. Any dice that an opposing player rolls are enemy dice. This is in contrast with friendly."""
        "ENGAGEMENT PHASE":
            name: "Engagement Phase"
            text: """The Engagement Phase is the fourth phase of the round. During this phase, each ship <strong>engages</strong>, one at a time, starting with the ship with the highest initiative and continues in descending order. <br><br>When a ship engages, it may perform an attack. <br>• After all ships of a given initiative have engaged, all destroyed ships are removed. Then, continuing in descending order, this process continues with all ships of the same initiative engaging and then removing all destroyed ships. <br>• If a player has multiple ships with the same initiative, the player engages them in any order, engaging one ship before engaging another ship of the same initiative value. <br>• If multiple players have ships with the same initiative, player order is used to determine the order. The first player engages all of their ships of a given initiative before the second player engages all of their ships of that initiative. <br>• Disarmed ships still engage even though they cannot perform attacks. <br>• Each ship engages only once during this phase."""
        "ENVIRONMENT CARDS":
            name: "Environment Cards"
            text: """See Appendix: Environment Cards."""
        "EVADE":
            name: "Evade"
            text: """Pilots can evade to fly defensively. When a ship performs an %EVADE% action, it gains one evade token. <br><br>A ship is <strong>evading</strong> while it has at least one evade token. Evade tokes are circular, green tokens. While an evading ship defends, during the Modify Defense Dice step, it can spend one or more evade tokens to change that many of its blank or %FOCUS% results to %EVADE% results. <br>• If an ability instructs a ship to gain an evade token, this is different than performing an %EVADE% action. A ship that gains the token without performing the action can still perform the %EVADE% action this round."""
        "FACTION":
            name: "Faction"
            text: """There are seven factions in the game: Rebel (The Rebel Alliance), Imperial (The Galactic Empire), Scum (Scum and Villainy), Resistance, First Order, Republic (Grand Army of the Republic), and Separatist (Separatist Alliance).<br><br>All ship cards and some upgrade cards are aligned to one of these factions. A squad cannot typically contain cards from different factions. <br>• Upgrade cards can be used by any faction unless they have a restriction."""
        "FAIL":
            name: "Fail"
            text: """Some effects can fail, which means the effect did not resolve as intended and instead is resolved in a default way. <br>• A ship can fail when it barrel rolls, boosts, coordinates, decloaks, deploys, jams, locks, or SLAMs. <br>• An effect that fails does not trigger any effects that would occur after a ship resolves that effect. <br>• If an action fails, the player does not choose a different action to perform and cannot choose to resolve the effect in a different way. <br>• If an action fails, since the action was not completed, that ship cannot perform a linked action. <br>• After a red action fails, the ship gains a stress token."""
        "FIRING ARC":
            name: "Firing Arc"
            text: """See Arc."""
        "FIRST PLAYER":
            name: "First Player"
            text: """See Player Order."""
        "FLANKING":
            name: "Flanking"
            text: """See Arc."""
        "FLEE":
            name: "Flee"
            text: """A ship <strong>flees</strong> if any part of its base is outside the play area after it executes a maneuver. A ship that flees is removed from the game. <br>• While a ship moves, the ship does not flee if only the template is outside the play area. <br>• Before a fleeing ship is removed from the game, the only effects it resolves before being removed from the game are effects that trigger when it flees. <br>• A ship cannot flee while resolving a boost, barrel roll, decloak, or SLAM. <br>• Partially executing a maneuver can cause a ship to flee if any part of its base is outside the play area after the maneuver."""
        "FOCUS":
            name: "Focus"
            text: """ Pilots can focus to concentrate and expand their combat prowess. When a ship performs the %FOCUS% action, it gains one focus token. <br><br>A ship is focused while it has at least one focus token. Focustokens are circular, green tokens. A focused ship follows these rules: <br>• While a focused ship performs an attack, during the Modify Attack Dice step, it may spend a focus token to change all of its %FOCUS% results to %HIT% results. <br>• While a focused ship defends, during the Modify Defense Dice step, it may spend a focus token to change all of its %FOCUS% results to %EVADE% results. <br><br>Additionally: <br>• A ship cannot spend a focus token to change %FOCUS% results to %HIT% or %EVADE% results if it does not have any %FOCUS% results. <br>• If an ability instructs a ship to gain a focus token, this is different than performing a %FOCUS% action. A ship that gains a token without performing the action can still perform the %FOCUS% action this round."""
        "FRIENDLY":
            name: "Friendly"
            text: """ All ships/devices controlled by the same player are <strong>friendly</strong> to each other. Any dice rolled by that player are friendly to those ships. This is in contrast with enemy. <br>• Ships cannot perform attacks against friendly ships, unless specified otherwise. <br>• A ship is friendly to itself and can affect itself with any of its abilities that affect friendly ships, unless those abilities explicitly refer to “other” friendly ships."""
        "FULL ARC":
            name: "Full Arc"
            text: """See Arc."""
        "FULLY EXECUTE":
            name: "Fully Execute"
            text: """See Overlap."""
        "FUSE MARKER":
            name: "Fuse Marker"
            text: """A device is <strong>fused</strong> while it has at least one fuse marker. When a device would detonate, if it is fused, one fuse marker is removed from that device instead, and that device does not detonate."""
        "GAME MODE":
            name: "Game Mode"
            text: """There are various game modes that limit which ship and upgrade cards are available for squad building. The X-Wing Squad Builder shows the limitations for the various game modes presented at any given time. Check out X-Wing.com for additional information. <br>• The squad point cost for cards can vary between game modes."""
        "GUIDES":
            name: "Guides"
            text: """Each ship’s base has two pairs of guides, one pair on the front and one pair on the back. Some devices also have a pair of guides. <br>• Guides on a ship’s base are ignored only while measuring range or determining whether a ship is in an arc."""
        "HIT":
            name: "Hit"
            text: """During the Neutralize Results step of an attack, the attack hits if at least one %HIT% or %CRIT% result remains uncanceled. If no %HIT% or %CRIT% results remain, the attack misses."""
        "HULL":
            name: "Hull"
            text: """The yellow number on a ship card is the ship’s hull value. The hull value indicates how many damage cards it must have to be destroyed. <br>• The amount of <strong>hull remaining</strong> for a ship is the difference between the hull value and the number of damage cards it has."""
        "ID MARKER":
            name: "ID Markers"
            text: """ID markers relate ships in the play area to their respective ship card and any locks they have. Players must assign ID markers to each of their ships during setup. <br><br>To assign an ID marker to a ship, the player places one ID marker on the ship’s card. Then they insert the two corresponding ID markers into the tower of the ship’s base. The color of the number on the sides that face outward must match the color of the faceup marker on the ship card. <br>• Players can color their ID markers, (using a marker, brush, etc.) so long as all of their fielded ships match. <br>• During setup, players must be able to clearly differentiate which ships are on each side by using differently colored ID markers."""
        "ION":
            name: "Ion"
            text: """A ship is <strong>ionized</strong> while it has a number of ion tokens relative to its size: at least one for a small ship, at least two for a medium ship, and at least three for a large ship. Ion tokens are red tokens. <br><br>During the Planning Phase an ionized ship is not assigned a dial. <br><br>During the Activation Phase, an ionized ship that did not have a dial assigned to it during the Planning Phase activates as follows: <br><br>1. The ship skips its Reveal Dial step. <br>2. During the Execute Maneuver step, the ionized ship executes the <strong>ion maneuver</strong>. The ion maneuver is a blue [1 %STRAIGHT%] maneuver. The bearing, difficulty, and speed of this maneuver cannot be changed unless an ability explicitly affects the ion maneuver. <br>3. During the Perform Action step, the ship can perform only the %FOCUS% action. <br>4. After the ship finishes this activation, it removes all of its ion tokens. <br><br>Additionally: <br>• An ionized ship cannot perform any action except the %FOCUS% action. <br>• Some special weapons inflict ion tokens instead of dealing damage. <br>• If a ship becomes ionized after the Planning Phase (and therefore has been assigned a dial) but before it has activated during the Activation Phase, it activates as normal. During the next Planning Phase, if the ship is still ionized, it is not assigned a dial and proceeds with the ion maneuver during the Activation Phase. <br>• Since an ionized ship does not have a dial assigned to it and does not reveal its dial, it cannot resolve any effects that trigger after it reveals its dial."""
        "INFLICT":
            name: "Inflict"
            text: """Some special weapons inflict tokens instead of dealing damage. If an attack inflicts tokens, the defender gains the number and type of tokens specified."""
        "IN FRONT OF":
            name: "In Front Of"
            text: """See Arc."""
        "INITIATIVE":
            name: "Initiative"
            text: """A ship’s initiative value is the orange number to the left of the ship’s name on its ship card. Initiative is used to determine the order in which ships can use abilities during the System Phase, activate during the Activation Phase, engage during the Engagement Phase, and are placed during setup. <br>• If several abilities alter the initiative of a ship, only the most recent ability is applied. <br>◊ If the most recent effect ends (such as “at the end of the Engagement Phase”), the ship’s initiative returns to the initiative established by the most recent ability that is still active."""
        "JAM":
            name: "Jam"
            text: """Pilots can jam to conduct electronic warfare and confuse other ships’ systems. When a ship performs the %JAM% action, it jams. A <strong>jamming ship</strong> is a ship that is attempting to jam by performing the following steps: <br><br>1. Measure range from the jamming ship to any enemy ships. <br>2. Choose an enemy ship at range 1. <br>3. The chosen ship gains one jam token. <br><br>A ship is <strong>jammed</strong> if it has at least one jam token. Jam tokens are circular, orange tokens. When a ship becomes jammed, the player whose effect caused the ship to gain the jam token chooses for the ship to either remove one of its green tokens or break one of its locks. If either effect is resolved, it removes the jam token. If the ship does not have any green tokens or is not maintaining any locks, it remains jammed. <br><br>After a jammed ship gains a green token or acquires a lock, the jammed ship removes that token or breaks that lock. Then it removes one jam token. <br>• Some special weapons inflict jam tokens instead of dealing damage. <br>• While a ship attempts to jam, it fails if no ship is chosen. <br>• Any abilities that cause a jammed ship to gain a green token or acquire a lock still trigger any effects that occur from resolving that ability even if the token is removed or the lock is broken. The jam token does not cause that ability to fail. <br>• If an ability instructs a ship to jam, this is different than performing a %JAM% action. A ship that jams without performing the action can still perform the %JAM% action this round."""
        "KOIOGRAN TURN":
            name: "Koiogran Turn"
            text: """See Bearing."""
        "LAUNCH":
            name: "launch"
            text: """See Device."""
        "LIMITED":
            name: "Limited"
            text: """Some ship cards and upgrade cards have limitations. These <strong>limited cards</strong> are identified by a number of bullets (•) to the left of their names. During squad building, a player cannot field more copies of cards that share that name than the number of bullets in front of the name. <br>• For example, if one bullet appears in front of a card’s name, it can be included only once in a squad. Likewise, if two bullets appear in front of a card’s name, it can be included up to twice in a squad. <br>• This restriction also applies across card types. For example, if a name has two bullets in front of it, the player could field two ship cards with that name, two upgrades with that name, one ship card and one upgrade with that name, etc."""
        "LINKED ACTION":
            name: "Linked Actions"
            text: """Linked actions allow a ship to perform an action after performing another action. Linked actions can appear on a ship or upgrade card in the linked action bar just to the right of the action bar. After the ship performs the action from its action bar, it can perform the attached action listed on the linked action bar. <br>• After a ship performs an action with an attached linked action, if the player wants to resolve the linked action, it is added to the ability queue. <br>• A linked action can be performed after performing the action it is attached to even if that action was granted by a card effect or other game effect."""
        "LOCK":
            name: "Lock"
            text: """Ships can lock to use their computer to acquire targeting data on environmental hazards or other ships. When a ship performs a %LOCK% action, it acquires a lock. A <strong>locking ship</strong> is a ship that is attempting to acquire a lock by performing the following steps: <br><br>1. Measure range from the locking ship to any number of objects. <br>2. Choose another object at range 0–3. <br>3. Assign a lock token to it with the number matching the ID marker of the locking ship. <br><br>An object is <strong>locked</strong> while it has at least one lock token assigned to it. Lock tokens are red tokens. While a ship has another ship locked, it follows this rule: <br>• During the Modify Attack Dice step of a ship’s attack, it can spend a lock token that it has on the defender to reroll one or more of its attack dice. <br><br>Additionally: <br>• When a ship is instructed to <strong>break</strong> a lock it has, the lock token corresponding to its ID token is removed. <br>• While acquiring a lock, it fails only if there is no valid object to choose. <br>• A ship cannot acquire or have a lock on itself. <br>• An object can be locked by more than one ship. <br>• A ship can maintain only one lock. If a locking ship already has a lock, before the chosen object would be assigned a lock token, the ship’s former lock token is removed. <br>• If an ability instructs a ship to acquire a lock, this is different than performing a %LOCK% action. A ship that acquires a lock without performing the action can still perform the %LOCK% action this round. <br>◊ If a ship is instructed to acquire a lock, the object it locks must be at range 0–3 unless otherwise specified. """
        "MANEUVER":
            name: "Maneuver"
            text: """A maneuver is a type of move that a ship can execute. Each maneuver has three components: speed (a number 0–5), difficulty (red, white, or blue), and bearing (an arrow or other symbol). Each bearing is further defined with a direction. <br><br>A ship can <strong>execute</strong> a maneuver by resolving the following steps in order:<br><br>1.<strong> Maneuver Ship:</strong> During this step, the ship moves using the matching template. <br>a. Take the template that matches the maneuver from the supply. <br>b. Set the template between the ship’s front guides (so that it is flush against the base). <br>c. Pick up and place the ship at the opposite end of the template and slide the rear guides of the ship into the template. <br>d. Return the template to the supply. <br><br>2. <strong>Check Difficulty:</strong> During this step, if the maneuver is red, the ship gains one stress token; if the maneuver is blue, the ship removes one stress token and one strain token and one deplete token. <br><br>Additionally: <br>• While executing a maneuver, if a ship would be placed at the end of the template on top of another object, it has overlapped that object. <br>• While executing a maneuver, if only the template was placed on top of another object, the ship has moved through the object. <br>• While executing a maneuver, the ship is picked up from its starting position and placed in its final position. The full width of the ship’s base is ignored except in its starting and final positions. <br>• If a stressed ship attempts to execute a maneuver with a red difficulty, the ship performs a white [2 %STRAIGHT%] maneuver instead. <br>• A card effect can cause a ship to execute a maneuver that does not appear on its dial. <br>• Some abilities reference a ship’s <strong>revealed maneuver</strong> outside of that ship’s activation. A ship’s revealed maneuver is the maneuver selected on its dial, which remains faceup next to that ship’s ship card until the next Planning Phase. <br>◊ If a ship’s dial is not revealed, or it was not assigned a dial that round, that ship does not have a revealed maneuver."""
        "MINE":
            name: "Mine"
            text: """A mine is a type of device that is placed in the play area through a card effect from a %DEVICE% upgrade card. The upgrade card that corresponds to the mine has the “Mine” trait at the top of its card text. Mines can be dropped or launched during the System Phase and typically detonate after they are moved through or overlapped by a ship."""
        "MISS":
            name: "Miss"
            text: """During the Neutralize Results step of an attack, the attack misses if no %HIT% or %CRIT% results remain. The attack hits if at least one %HIT% or %CRIT% result remain uncanceled. • If the attack misses, the Deal Damage step of the attack is skipped."""

        "MOVE":
            name: "Move"
            text: """A ship <strong>moves</strong> when it executes a maneuver or otherwise changes position using a template (such as barrel rolling or boosting). <br><br>A ship <strong>moves through</strong> an object if the template is placed on that object when the ship moves. <br>• If a ship moves through an obstacle, it suffers the effects of that obstacle. <br>• If a ship moves through a device, it can suffer effects based on the device. <br>• If a ship moves through another ship, there is no inherent effect. Due to the physical miniature being in the way, players should mark the positions of any intervening ships and temporarily remove them. To mark an intervening ship’s position, players can either use the position markers provided in the core set or place templates in the ships’ guides or along the side of the base. Then those ships are physically removed to complete the move. After the move is complete, the removed ships are returned to their original positions."""
        "MOVE THROUGH":
            name: "Move Through"
            text: """See Move."""
        "OBJECTS":
            name: "Objects"
            text: """Ships, obstacles, and devices are all <strong>objects</strong>. The exact position of objects in the play area is tracked and restricted by game effects. <br>• Ships can acquire locks on objects. <br>• Ships can move through objects."""
        "OBSTACLES":
            name: "Obstacles"
            text: """Obstacles act as hazards that can disrupt and damage ships. A ship can suffer effects by moving through, overlapping, or while being at range 0 of obstacles. <br><br>While a ship executes a maneuver, if it moves through or overlaps an obstacle, it executes its maneuver as normal but suffers an effect based on the type of obstacle: <br><br>• <strong>Asteroid:</strong> After executing the maneuver, it rolls one attack die. On a %HIT% result, the ship suffers one %HIT% damage; on a %CRIT% result, it suffers one %CRIT% damage. Then the ship skips its Perform Action step this round. <br>• <strong>Debris Cloud:</strong> After the Check Difficulty step, the ship gains one stress token. After executing the maneuver, it rolls one attack die. On a %CRIT% result, the ship suffers one %CRIT% damage. <br>• <strong>Gas Cloud:</strong> After executing the maneuver, roll one attack die. On a %FOCUS% or %HIT% result, the ship gains one strain token. Then the ship skips its Perform Action step this round. <br><br>While a ship is not executing a maneuver, if it moves through or overlaps an obstacle, it suffers an effect based on the type of obstacle (after resolving its move, if applicable): <br><br>• <strong>Asteroid:</strong> The ship rolls one attack die. On a %HIT% result, the ship suffers one %HIT% damage; on a %CRIT% result, it suffers one %CRIT% damage. <br>• <strong>Debris Cloud:</strong> The ship gains one stress token. The ship rolls one attack die. On a %CRIT% result, the ship suffers one %CRIT% damage. <br>• <strong>Gas Cloud:</strong> The ship rolls one attack die. On a %FOCUS% or %HIT% result, the ship gains one strain token. <br><br>While a ship is at range 0 of an obstacle it may suffer different effects. <br>• <strong>Asteroid:</strong> The ship cannot perform attacks. <br><br>While a ship performs an attack, if the attack is obstructed by an obstacle, the defender rolls one additional defense die. <br><br>Additionally: <br>• Obstacles are placed during the Place Obstacles step of setup. <br>• Some cards can also place obstacles during the game in the same manner as devices (see Device). <br>• If an obstacle is placed such that one or more ships overlap it, those ship resolve any effects of overlapping it. <br>• A ship that is overlapping an obstacle can still perform actions granted from other game effects. <br>• For the purpose of overlapping obstacles, if a ship partially executes a maneuver, only the portion of the template that is between the starting and final positions of the ship is counted. Ignore the portion of the template that the ship moved backward along to resolve the overlap. <br>• If a ship moves through or overlaps more than one obstacle, it suffers the effects of each obstacle, starting with the obstacle that was closest to the ship in its starting position and proceeding along the template. <br>• Before a ship moves, if it is at range 0 of an obstacle, it does not suffer the effects of that obstacle unless it moves through or overlaps that obstacle again. <br>• Huge ships have separate rules related to obstacles (see Appendix: Huge Ships)."""
        "OBSTRUCTED":
            name: "Obstructed"
            text: """An attack is <strong>obstructed</strong> if the attacker measures range through an object. If a ship or device obstructs an attack, there is no inherent effect. If an obstacle obstructs an attack, there is an additional effect. <br>• If at least one asteroid, debris cloud, or gas cloud obstructs an attack, the defender rolls one additional defense die during the Roll Defense Dice step. <br>• If at least one gas cloud obstructs an attack, the defender may change 1 blank result to an %EVADE% result. <br>• The attacker measures from the closest point of its base to the closest point of the defender’s base that is in the attack arc, therefore the attacker cannot measure range from or to another point in order to avoid measuring through an object. <br>◊ If multiple points are at equal distance from the attacker (for example, if the attacker and defender are parallel), the attacker chooses one of those lines for measuring range. In the example, the X-wing can choose to make this attack be obstructed or not."""
        "OVERLAP":
            name: "Overlap"
            text: """While a ship executes a maneuver or otherwise moves, it <strong>overlaps</strong> an object if the ship’s final position would physically be on top of an object. <br><br>A ship <strong>fully</strong> executes a maneuver if it does not overlap a ship. If a ship executes a maneuver and overlaps a ship, it must <strong>partially</strong> execute that maneuver by performing the following steps: <br><br>1. Move the ship backward along the template until it is no longer on top of any other ships. While doing so, adjust the position of the ship so that the hashmarks in the middle of both sets of guides remains centered over the line down the middle of the template. <br>2. Once the ship is no longer on top of any other ship, place it so that it is touching the last ship it backed over. This may result in the ship returning to its starting position. <br>3. The ship skips its Perform Action step. <br><br>• Even though a ship that partially executes a maneuver must skip its Perform Action step, it can still perform actions granted from other game effects. <br>• Even if a ship partially executes a maneuver, it is still treated as having executed a maneuver of the indicated speed, bearing, and difficulty. <br><br>Additionally: <br>• After an object is placed, if it is placed underneath one or more ships, those ships resolve any effects of overlapping the object."""
        "PARTIALLY EXECUTE":
            name: "Partially Execute"
            text: """See Overlap."""
        "PILOT ABILITY":
            name: "Pilot Ability"
            text: """See Abilities."""
        "PLANNING PHASE":
            name: "Planning Phase"
            text: """The Planning Phase is the first phase of the round. During the Planning Phase, each player secretly sets a maneuver for each of their ships. To set a ship’s maneuver, the player takes a dial matching the ship’s type and rotates the dial until the arrow points at the desired maneuver. Then the dial is placed facedown in the play area next to the matching ship. <br><br>The phase ends when each ship has a dial assigned to it and both players agree to proceed to the System Phase. <br>• Players can assign their dials in any order. <br>• Players are allowed to change their selections on their dials as long as the phase has not ended. <br>• A player must inform their opponent if they wish to touch or look at one of their dials during the System or Activation Phase. <br>• Ionized ships are not assigned dials."""
        "PLAY AREA":
            name: "Play Area"
            text: """The play area is the defined area on a flat surface on which the ships are placed. After executing a maneuver, if any part of a ship’s base is outside the play area, that ship has fled. <br><br>The recommended play area for a standard 200-point dogfight is 3’ x 3’ (91 cm x 91cm). If playing with other squad point totals, the players can expand or contract the play area in one or both dimensions to create a suitable space for the game."""
        "PLAYER ORDER":
            name: "Player Order"
            text: """Player order is used as a tiebreaker for many game effects. If players are instructed to resolve an effect in <strong>player order</strong>, the first player resolves all of their effects first, then the second player resolves all of their effects. <br><br>During the Determine First Player step of setup, the player whose squad has the lowest squad point total chooses which player is the first player. The first player is assigned the First Player marker. <br><br>If players are tied for squad point total, one player calls either “hits” (%HIT% or  %CRIT%), or “misses” (blank or %FOCUS%). Then the other player rolls one attack die. If the player chose the set of results that matches the die, that player chooses which player is the first player; otherwise the other player chooses. <br>• During the System, Activation, and Engagement Phases, player order is used as a tiebreaker after initiative. <br>• When playing with more than two players, player order is determined for all players involved. The player with the lowest squad point total chooses one player to be the first player. Then the player with the next lowest squad point total chooses another player to be the second player. This procedure continues until all players have been assigned a player number."""
        "POSITION MARKER":
            name: "Position Marker"
            text: """The position marker is used to assist with tracking the position of intervening ships when attempting to move ships. To use the position marker, place it at the corner of an intervening ship, aligning the guides with the holes in the position marker. This will track the position of the ship in order to place it back in the play area accurately."""
        "PRIMARY WEAPON":
            name: "Primary Weapon"
            text: """Each ship has up to two primary weapons listed on its ship card. Each primary weapon has an arc symbol and a red attack value. During a ship’s attack, it chooses a weapon to perform an attack with. If it performs an attack using a primary weapon, the attack value indicates how many attack dice it rolls during the Roll Attack Dice step and the arc symbol indicates where the defender must be located. <br>• A primary weapon requires the attack range to be range 1–3 and has no cost by default. <br>• Since primary weapons are not special weapons, they do not benefit from abilities that trigger while performing a special attack."""
        "RANGE":
            name: "Range"
            text: """The <strong>range</strong> is the distance between two objects as measured by the range ruler. The range ruler is divided into three numbered range bands. <br><br>To measure range between two objects, place the range ruler over the point of the first object that is closest to the second object, then aim the other end of the ruler toward the point of the second object that is closest to the first object. The ships are <strong>at</strong> the range that corresponds to the range band that isover the closest point of the second object. <br><br>While measuring <strong>attack range</strong> for an attack, the attacker measures to the closest point of the target ship that is <strong>in</strong> the attacker’s attack arc. <br>• The following terms are used concerning range: <br>◊ <strong>Range #–#:</strong> The range includes all of the range bands from the minimum to the maximum specified. <br>◊ <strong>At:</strong> An object is at a specified range if the closest point of it is inside that range. <br>◊ <strong>Within:</strong> An object is within a specified range if the entirety of it is inside that range. <br>◊ <strong>Beyond:</strong> An object is beyond a specified range if no part of it is between the specified range and the object range is being measured from. <br><br>• While measuring range to a ship, range is measured to the closest point of the ship’s base, not its ship token nor the miniature itself. <br>• While measuring range to a non-ship object, range is measured to the point of that object that is closest to the ship’s base. <br>• While measuring range, players use a single edge of the range ruler; the width and thickness of the ruler are irrelevant. <br>• Range 0 does not appear on the range ruler, but is used for describing the range of objects that are physically touching. <br>◊ After a ship partially executes a maneuver, it is at range 0 of the last ship it overlapped. <br>◊ An object is at range 0 of an obstacle or device if it is physically on top of it. <br>◊ A ship is at range 0 of another ship if it is physically touching another ship. <br>◊ If two ships are at range 0 of each other, they remain at range 0 until one of the ships moves in a way that results in their bases no longer being in physical contact. <br>◊ Although rare, it is possible for a ship to move in such a way that it is at range 0 of another ship (in physical contact with it) without having overlapped it."""
        "REMOVED FROM THE GAME":
            name: "Removed From The Game"
            text: """After a ship is destroyed or flees,it is <strong>removed from the game.</strong> If a ship is removed from the game, it returns all of its tokens to the supply, its ship card is flipped facedown, and the ship is placed on top of its ship card. <br>• At the end of a round, if all of a player’s ships have been removed from the game, the game ends and the other player wins. <br>• Ships that are placed in reserve are not removed from the game."""
        "RESERVE":
            name: "Reserve"
            text: """Ships can sometimes be placed in reserve from card effects. A ship that is placed in reserve is placed on its ship card. While a ship is in reserve, it is not assigned a dial, it cannot perform actions, and it cannot attack. <br>• A ship that is placed in reserve will have an effect that causes it to be placed in the play area.<br>• Ships that are placed in reserve are not removed from the game. <br>• The abilities of a ship in reserve are inactive unless the ability explicitly allows it to be used while it is in reserve. <br>• A ship that is docked is placed in reserve. <br>• During the End Phase, a ship that is in reserve still removes all circular tokens and recovers charges on all of its cards with recurring charge icons."""
        "REVEAL":
            name: "Reveal"
            text: """See Activation Phase."""
        "REVERSE BANK":
            name: "Reverse Bank"
            text: """See Bearing."""
        "REVERSE STRAIGHT":
            name: "Reverse Straight"
            text: """See Bearing."""
        "ROUND":
            name: "Round"
            text: """A single round consists of five phases resolved in the following order: <br>1. Planning Phase <br>2. System Phase <br>3. Activation Phase <br>4. Engagement Phase <br>5. End Phase <br><br>The first round starts after setup."""
        "ROTATE":
            name: "Rotate"
            text: """Pilots can rotate to alert a gunner or aim one of the ship’s turret-mounted armaments. When a ship performs the %ROTATEARC% action, it rotates the turret arc indicator to select any other standard arc. <br>• If a ship rotates a double turret arc indicator, it must select the other two standard arcs it was not already selecting. <br>• If an ability instructs a ship to rotate its %SINGLETURRETARC% indicator, this is different than performing a %ROTATEARC% action. A ship that rotates its %SINGLETURRETARC% indicator without performing the action can still perform a %ROTATEARC% action this round."""
        "RANGE BONUS":
            name: "Range Bonus"
            text: """During an attack, the attacker or defender can roll additional dice depending on the attack range. For attack range 0–1, the attacker rolls one additional attack die during the Roll Attack Dice step. For attack range 3, the defender rolls one additional defense die during the Roll Defense Dice step. <br>• Range bonuses are applied for all attacks unless stated otherwise. Some special weapons have a small ordnance icon on them to indicate that range bonuses cannot be applied with attacks using those weapons. <br>• Although the range bonus applies at range 0, a ship cannot normally perform a primary attack at range 0. <br>• Huge ships have additional rules for attacks at range 4 and 5. See Appendix: Huge Ships. """
        "REINFORCE":
            name: "Reinforce"
            text: """Pilots can reinforce to angle their deflector shields and increase the defensiveness of a portion of their ship. When a ship performs the %REINFORCE% action, it gains a reinforce token with either the fore or aft side faceup. <br><br>A ship is <strong>reinforced</strong> while it has a reinforce token assigned to it. Reinforce tokens are circular, green tokens. While a reinforced ship defends, if the attacker is inside the full arc specified by the reinforce token and not in the other full arc, the token provides an effect. The attacker needs to be in the defender’s %FULLFRONTARC% arc for the fore reinforce token or be in the defender’s %FULLREARARC% arc for the aft reinforce token. <br><br>During the Neutralize Results step, if the attack would hit and there is more than one %HIT%/%CRIT% result remaining, one %EVADE% result is added to cancel one result. <br>• A ship can have more than one reinforce token. If a ship has multiple of the same type of reinforce token, their effects are applied one at a time. Thus, for two reinforce tokens to both apply their effect, there would need to be at least three %HIT%/%CRIT% results remaining. <br>• When a ship gains a reinforce token, unless specified otherwise, the player that controls that ship chooses whether it gains a fore reinforce token or an aft reinforce token. <br>• A ship does not spend the reinforce token when resolving its effect. <br>• If an ability instructs a ship to gain one reinforce token, this is different than performing a %REINFORCE% action. A ship that gains the token without performing the action can still perform the %REINFORCE% action this round."""
        "RELOAD":
            name: "Reload"
            text: """Pilots can reload to rearm ordnance tubes by moving around ammo on their ship. When a ship performs the %RELOAD% action, it reloads by performing the following steps: <br>1. Choose one of the ship’s equipped %TORPEDO%,  %MISSILE%, or %DEVICE% upgrade cards that has fewer active %CHARGE% than its charge limit. <br>2. That card recovers one %CHARGE%. <br>3. The ship gains one disarm token. <br><br>Additionally: <br>• If an ability instructs a player to reload, this is different than performing a %RELOAD% action. A ship that reloads without performing the action can still perform the %RELOAD% action this round. """
        "REMOTES":
            name: "Remotes"
            text: """Remotes are devices that have initiative, agility, and hull values, and can be attacked. Ships can move through, overlap, or be at range 0 of remotes. <br><br><h5>Attacking Remotes</h5> A remote can be declared as the defender. While attacking a remote, treat it as a ship, with the following exceptions and notes: <br>• Effects that refer to “friendly ships” or "allied ships" do not apply to a remote. <br>• Effects that refer to “enemy ships” only apply to a remote if the attacker is the source of the effect. <br>• If a remote has printed arcs and center lines, these arcs extend from range 0–3. A ship can be in these arcs or zones as it would be with another ship. <br>• If a remote does not have a midway line, a ship cannot be in front of, behind, or flanking it. <br>• If a remote does not have any arcs, a ship cannot be in or outside of any of that remote’s arcs. <br>• An attack made against a remote can be obstructed and range bonuses are applied to it as normal. <br>• If a remote does not have specified size, it is neither smaller nor larger than a ship for the purposes of effects. <br><br><h5>Damaging Remotes</h5> If a remote suffers one or more  %HIT%/%CRIT% damage, deal 1 facedown damage card to it. If it has a number of damage cards greater than or equal to its hull value, it is destroyed. After a remote is destroyed, remove it from the play area and shuffle any damage cards assigned to it back into the damage deck. If the attack occurred at the same initiative as the remote’s initiative, it is removed after all effects at that initiative are resolved, per Simultaneous Fire. <br><br><h5>Using Remotes</h5> A remote resolves effects during the System Phase, activates during the Activation Phase, and engages during the Engagement Phase at its listed initiative value, resolving any effects specified on its card for these phases. During any other phase, it resolves any abilities listed on its remote card that apply during that phase. Additionally, the following apply to remotes: <br>• A remote cannot perform actions or be assigned tokens except for locks. <br>• A remote can be assigned markers or counters if an effect instructs it— place these on its remote card. <br>• If an effect  instructs a player to place that a remote on a ship card, pick it up and place it on the relevant ship card. It can be affected only by game effects that return it to the play area. Its damage cards are not removed. <br>• Some devices cause damage to remotes, as described in their individual entries. If a device does not state that it affects remotes, it does not affect remotes. <br><br><h5>Relocating Remotes</h5> If an effect <strong>relocates</strong> a remote, its controlling player picks it up and places it in the new location as instructed by the effect. Additionally: <br>• An effect might instruct a player to relocate a remote <strong>forward</strong> using a specific template (or a choice of several templates). To do this, the player places the listed template at the remote's front guides, picks up the remote, and places the remote's rear guides at the other end of the template, similar to moving a ship. <br>• If a remote would be relocated such that any part of it is outside of the play area, it flees in the same manner as a ship, and is removed."""
        "SEGNOR’S LOOP":
            name: "Segnor's Loop"
            text: """See Bearing."""
        "SETUP":
            name: "Setup"
            text: """Before playing, resolve the following steps: <br>1. <strong>Gather Forces:</strong> Each player places their ships and upgrade cards on the table in front of them. For each ship that has a shield value, charge limit, or Force capacity, place the corresponding %SHIELD%, %CHARGE%, or %FORCE% above the ship and/or upgrade cards. Each player assigns ID markers to each of their ships. <br>2. <strong>Determine Player Order:</strong> The player with the lowest squad point total chooses who is the first player. Otherwise, randomly determine the first player. <br>3. <strong>Establish Play Area:</strong> Establish a 3’ x 3’ (91 cm x 91 cm) play area on a flat surface or use a game mat, such as the Fantasy Flight Games Starfield Game Mat</strong>. Then players pick opposite edges of the play area to be their player edges. <br>4. <strong>Place Obstacles:</strong> In player order, players take turns choosing an obstacle and placing it into the play area until all six obstacles have been placed. Obstacles must be placed beyond range 1 of each other and beyond range 2 of each edge of the play area. <br>5. <strong>Place Forces:</strong> Players place their ships into the play area in initiative order from lowest to highest initiative, using player order as a tiebreaker. Ships must be placed within range 1 of their player edge. When a ship with a turret arc indicator is placed, the player rotates the arc to select a standard arc. Each ship with a turret arc indicator may rotate its indicator when the ship is placed. <br>6. <strong>Prepare Other Components:</strong> Shuffle the damage deck and place it facedown outside the play area. If the players have more than one damage deck, each player uses their own deck. Then the supply of range rulers, templates, dice, and tokens is created near the play area. <br><br>Additionally: <br>• If a card has the “Setup:” header, this effect is resolved during the appropriate step of setup"""
        "SHIELDS":
            name: "Shields"
            text: """Shields(%SHIELD%) are a type of charge. See Charges."""
        "SHIP":
            name: "Ship"
            text: """A ship is composed of a plastic miniature, base, pegs, a ship token, and ID tokens. <br>• A ship’s plastic miniature must match the ship’s type as indicated on the ship card. <br>• A ship must use the dial that matches the ship’s type. <br>• Some plastic miniatures extend beyond their plastic base. For this reason, the miniature does not affect any game mechanics. The miniature may overlap obstacles and hang over the edge of the play area without issue. <br><br>If a miniature would touch another miniature or disrupt a ship’s movement, the players should add or remove one peg from the base to prevent this contact. Otherwise, the players can temporarily remove the miniature from its base until ships have moved to allow it to be returned."""
        "SHIP ABILITIES":
            name: "Ship Abilities"
            text: """Some ships have ship abilities on their ship cards listed below a pilot ability or flavor text. Ship abilities are the same across all pilots for a type of ship. <br>• Some ship abilities can have <strong>“Action:”</strong> headers. These are called <strong>ship ability actions.</strong> These actions are not on a ship’s action bar."""
        "SHIP SIZES":
            name: "Ship Sizes"
            text: """There are four different ship sizes: small, medium, large, and huge. <br><br>A small ship uses a plastic base that is about 1-9/16” (4 cm) long. The rules of <strong>X-Wing</strong> are written for small ships and therefore there are no special exceptions for small ships. <br><br>A medium ship uses a plastic base that is about 2-3/8” (6 cm) long. Medium ships have the following exceptions: <br>• A medium ship requires two ion tokens before it is ionized and two tractor tokens before it is ractored. <br>• Medium ships barrel roll differently (including while decloaking). <br><br>A large ship uses a plastic base that is about 3-1/8” (8 cm) long. Large ships have the following exceptions: <br>• A large ship requires three ion tokens before it is ionized and three tractor tokens before it is tractored. <br>• Large ships barrel roll differently (including while decloaking). <br>• During setup, a large ship’s base may extend outside of range 1 as long as it fills the length of that area. A large ship cannot be placed with any portion of its base outside the play area. <br><br>A huge ship uses more than one plastic base. Huge ships have many additional rules. They were introduced in the first edition of X-Wing and will be reintroduced in an upcoming product. """
        "SHIP TYPE":
            name: "Ship Type"
            text: """Each ship has a ship type that is identified by the name of the type of ship listed on the bottom of its ship cards. <br>• Each ship must use the dial that matches their ship type. <br>• Some upgrade cards have ship restrictions that refer to ship type."""
        "SIMULTANEOUS FIRE":
            name: "Simultaneous Fire"
            text: """To represent that ships with the same initiative are essentially attacking at the same time, if a ship is destroyed during the Engagement Phase, it is removed after all ships that have the same initiative as the currently engaged ship have engaged."""
        "SLAM":
            name: "Slam"
            text: """Pilots can SLAM by activating their SubLight Acceleration Motors and careening through space at incredible speeds. A ship performs a %SLAM% action by performing the following steps: <br>1. The player chooses a maneuver from the ship’s dial. The maneuver must match the speed of the maneuver that the ship executed this round. <br>2. The ship executes the chosen maneuver. <br>3. The ship gains one disarm token. A ship can perform a  %SLAM% action only as the ship’s one action during the Perform Action step. Therefore a ship cannot perform a %SLAM% action if it is granted an action from another effect. <br>• A  %SLAM% action fails if the final position of the ship would cause it to flee. <br>• When a ship performs a  %SLAM% action, it has performed an action as well as executed a maneuver for the sake of abilities."""
        "SOLITARY":
            name: "Solitary"
            text: """A squad cannot include more than one card of the same upgrade type with the “solitary” restriction. For example, since all  %TACTICALRELAY% (Tactical Relay) upgrades have the solitary restriction, no squad can include more than one  %TACTICALRELAY% upgrade."""
        "SPECIAL WEAPON":
            name: "Special Weapon"
            text: """Special weapons appear as <strong>“Attack:”</strong> headers in card text. They provide additional types of attacks other than a ship’s primary weapon(s). <br><br>Special weapons have a combination of arc requirements, range requirements, attack value, and possibly other requirements. The <strong>arc icon</strong> indicates where the target needs to be in order to use this attack. The <strong>range requirement</strong> indicates the span of legal attack ranges. The red <strong>attack value</strong> is used to determine the number of attack dice to roll during the Roll Attack Dice step. For cards with special requirements, all of those requirements must be met in order to perform that attack. <br>• Some special weapons have a small <strong>ordnance icon</strong> on them to indicate that range bonuses are not applied with attacks using those weapons. <br>• Arc restrictions appear as arc icons listed to the left of the attack value. The arc restriction requires that the defender be in that arc of the attacker. <br>• Range requirements are white numbers that appear as a range of numbers listed below the attack value and arc restriction. <br>• Some attacks also have special requirements listed in parentheses after the header. <br>◊ The “Attack ( %LOCK%):” header indicates that the attacker must have a lock on the defender. <br>◊ The “Attack (%FOCUS%):” header indicates that the attacker must have a focus token. <br>• Since special weapons are not primary weapons, they do not benefit from abilities that trigger while performing a primary attack. <br>• Any type of upgrade card attack (such as a %CANNON% attack) is a special attack."""
        "SPEED":
            name: "Speed"
            text: """Each maneuver has three components: speed (a number 0–5), difficulty (red, white, or blue), and bearing (an arrow or other symbol). <br>• If the speed of a maneuver is increased or decreased, the speed of the maneuver is restricted to the templates that exist. <br>◊ For example, the speed of a [3 %SLOOPRIGHT%] cannot be increased and the speed of a [1 %STRAIGHT%] cannot be decreased. <br>• The speed of a [0 %STOP%] cannot be increased or decreased. <br>• Even if a ship partially executes a maneuver, it is still treated as having executed a maneuver of the indicated speed."""
        "SQUAD BUILDING":
            name: "Squad Building"
            text: """Each player builds a squad by choosing ships and upgrades whose total squad point cost does not exceed the total defined by the game mode. The recommended squad point total for a standard dogfight is 200 points. A player can build a squad using ship and upgrade cards with some restrictions: <br>• Each ship has an upgrade bar which is a list of upgrade icons that limit the number of upgrades and types of upgrades that the ship can equip. The <strong>X-Wing Squad Builder</strong> will enforce these rules. Additionally, a list of all ships’ upgrade bars is also available at X-Wing.com. <br>• Nearly all game modes limit ships to a specific faction to choose from. All ship cards must be from a single faction. Some upgrade cards have faction restrictions listed in their restriction field. <br>• Some upgrade cards have ship-size restrictions. Only ships of the given size can equip them. <br>• Some upgrade cards have ship-type restrictions. Only ships of that type can equip them. <br>• A squad’s cards are restricted by the rules of limited cards and solitary cards. <br>• A ship cannot equip more than one copy of an upgrade card with the same name."""
        "SQUAD POINTS":
            name: "Squad Points"
            text: """Each ship card and upgrade card has a squad point cost associated with it. This value is used during squad building in order to build lists that are legal for different game modes. These values are available from the <strong>X-Wing Squad Builder</strong> and are also available at X-Wing.com."""
        "STANDARD ARC":
            name: "Standard Arc"
            text: """See Arc."""
        "STANDARD SHIP":
            name: "Standard Ship"
            text: """A standard ship is any non-huge ship (see Appendix: Huge Ships)."""
        "STATIONARY":
            name: "Stationary"
            text: """See Bearing."""
        "STRAIGHT":
            name: "Straight"
            text: """See Bearing."""
        "STRAIN":
            name: "Strain"
            text: """A ship is <strong>strained</strong> while it has at least one strain token. While a strained ship defends, it rolls 1 fewer defense die. The strain token is a red token. <br>• After a strained ship applies the effect to roll 1 fewer defense die this way, it removes 1 strain token. <br>• After a strained ship executes a blue maneuver, it removes 1 strain token."""
        "STRESS":
            name: "Stress"
            text: """A ship is stressed while it has at least one stress token. A stressed ship cannot execute red maneuvers or perform actions. The stress token is a red token. <br>• A ship receives one stress token while it executes a red maneuver or after it performs a red action. Additionally, a ship removes one stress token while it executes a blue maneuver. <br>• If a stressed ship attempts to execute a red maneuver, it instead executes a white [2 %STRAIGHT%] maneuver. <br>◊ After a stressed ship reveals a red maneuver, abilities that change the maneuver can be used. After resolving these abilities, if the ship would still execute a red maneuver, it instead executes a white [2 %STRAIGHT%] maneuver. <br>• Huge ships have additional rules for stress (see Appendix: Huge Ships)."""
        "SUFFER DAMAGE":
            name: "Suffer Damage"
            text: """See “Damage.”"""
        "SUPPLY":
            name: "Supply"
            text: """The supply is the shared set of game components that are not being used by any player, such as unassigned focus tokens, maneuver templates, etc."""
        "SYSTEM PHASE":
            name: "System Phase"
            text: """The System Phase is the second phase of a round. During this phase, the sequence of play starts with the ship with the lowest initiative and continues in ascending order. <br><br>During this phase, each ship gets an opportunity to choose and resolve any abilities that are explicitly resolved during the System Phase. <br>• Without having specific upgrades, abilities, or tokens, most ships have no effects that can be resolved during this phase. Some abilities that can be used at this time include dropping and launching devices, decloaking,and deploying and docking ships. <br>• If a player has multiple ships with the same initiative value, the player resolves abilities in any order; resolving any abilities for one ship before resolving abilities for another ship of the same initiative value. <br>• If multiple players have ships with the same initiative value, player order is used to determine the sequence. The first player resolves any abilities of their ships with that initiative value in any order, then the second player resolves any abilities of their ships with that initiative value in any order, and so on."""
        "TALLON ROLL":
            name: "Tallon Roll"
            text: """See Bearing."""
        "TARGET":
            name: "Target"
            text: """The target of an attack is declared during the Declare Target step. Asuccessfully targeted enemy ship is the defender."""
        "TIMING":
            name: "Timing"
            text: """There are several terms used to indicate the specific timing of an effect: <br>• <strong>Before:</strong> The effect resolves immediately preceding the timing specified. <br>• <strong>At the start of:</strong> This timing is used with a specific phase or step. The effect triggers before anything occurs during that phase or step. <br>• <strong>While:</strong> This term is often used in combination with multi-stepped game effects such as an attack, an action, or a maneuver. Although less specific than the other timings, this term is used to narrow down when the ability is resolved during the round. Additional verbiage is required to identify when exactly the effect is applied. <br>◊ For example, in the context of an attack, if the ability rolls additional attack dice, the ability triggers during the Roll Attack Dice step. If the ability modifies defense dice, the ability triggers during the Modify Defense Dice step. <br>• <strong>At the end of:</strong> This timing is used with a specific phase or step of ship’s activation. This effect triggers after the normal effects of that phase or step have occurred. <br>• <strong>After:</strong> The effect resolves immediately following the timing specified. <br>The ability queue is used to resolve abilities that would resolve simultaneously."""
        "THREAT VALUE":
            name: "Threat Value"
            text: """Instead of using squad points, Quick Build cards use threat value, which is sometimes represented with the ?? icon,"""
        "TITLE":
            name: "Title"
            text: """A title is a type of upgrade that is used to represent a very specific version of a ship. Therefore, each title is restricted to a specific ship type. For example, the Millennium Falcon is a %TITLE% upgrade."""
        "TOKENS":
            name: "Tokens"
            text: """ Some abilities cause ships to gain, spend, or remove tokens. Tokens are used to track effects and come in a variety of colors. <br>• When a ship is instructed to gain a token, a token from the supply is placed in the play area next to the ship. <br>• When a ship is instructed to spend a token or there is an instruction to remove a token from a ship, a token of that type is returned from that ship to the supply. <br>• When a ship is instructed to transfer a token to another ship, it is removed from that ship and assigned to the other ship. <br>◊ If a ship involved in a transfer is not able to remove or gain the token involved, the transfer cannot take place. <h5>Token Colors and Shapes</h5> To help with memory, the token’s color and shape indicates both when the token is removed and whether the effect is positive or negative. <br>• Green and orange tokens are removed during the End Phase. These tokens are both circular. <br>• Blue and red tokens have special criteria for when they can be removed or spent. These tokens are diamond shaped. <br>Additionally: <br>• The physical position of a token in the play area does not provide any effect and is merely representational of belonging to the ship."""
        "TRACTOR":
            name: "Tractor"
            text: """A ship is <strong>tractored</strong> while it has equal to or greater than a specific number of tractor tokens, according to its size: a small ship requires at least one tractor token, a medium ship requires at least two tractor tokens, and a large ship require at least three tractor tokens. A tractor token is a orange token. The first time a ship becomes tractored each round, the player whose effect applied the tractor token may choose one of the following effects: <br>• Perform a barrel roll using the [1 %STRAIGHT%] maneuver template. The player applying the effect selects the direction of the barrel roll and the ship’s final position. <br>• Perform a boost using the [1 %STRAIGHT%] maneuver template. <br>This move can cause the ship to move through or overlap an obstacle. After a ship is moved this way, if an opponent moved it, the ship's player may choose to have the ship rotate 90° to the left or right. If they do, the ship gains one stress token. <br>While a tractored ship defends, it rolls one fewer defense die. <br>• Some special weapons inflict tractor tokens instead of dealing damage. <br>• Huge ships have additional rules for tractor tokens (see Appendix: Huge Ships)."""
        "TURN":
            name: "Turn"
            text: """See Bearing."""
        "TURRET ARC":
            name: "Turret Arc"
            text: """See Arc."""
        "UPGRADE CARDS":
            name: "Upgrade Cards"
            text: """When building a squad, a player can field upgrades for their ships by paying their associated squad point cost. When building a squad using the Squad Builder, each ship will have a squad point cost and an upgrade bar that shows how many and which types of upgrades that ship can equip. If there is a %TITLE% or %CONFIGURATION% available for the ship, it will list that here as well. Upgrades also have their own squad point cost.<br><br> Some upgrade cards have one or more of the following rules in their restrictions box: <br>• <strong>Rebel/Imperial/Scum:</strong> This upgrade can be equipped only to a ship of the specified faction.<br>• <strong>Small/Medium/Large/Huge ship:</strong> This upgrade can be equipped only to a ship of the specified size. <br>• <strong>Ship-type:</strong> If there is a type of ship listed, this upgrade can be equipped only to a ship of the specified type. <br>• <strong>Action:</strong> If there is an action icon, this upgrade can be equipped only to a ship with that action on its action bar. This does not include actions on its linked action bar. <br>• A ship cannot equip more than one copy of the same card. <br>• A squad’s cards are restricted by the rules of limited and solitary cards. <br>• Some effects can “exchange” or “equip” an upgrade card from one ship to another during or after setup. <br>◊ An effect can move an upgrade to a ship that does not have the matching icon on its upgrade bar. <br>◊ An effect cannot move an upgrade to a ship that does not meet the requirements set out in the restrictions box of the upgrade card unless the effect says to equip the upgrade “ignoring restrictions.”"""
        "UPGRADE ICONS":
            name: "Upgrade Icons"
            text: """Each upgrade icon uses the corresponding name listed below: <br>• %TALENT% Talent <br>• %FORCEPOWER% Force Power <br>• %TECH% Tech <br>• %SENSOR% Sensor <br>• %CANNON% Cannon <br>• %TURRET% Turret <br>• %TORPEDO% Torpedo <br>• %MISSILE% Missile <br>• %CREW% Crew <br>• %GUNNER% Gunner <br>• %TACTICALRELAY% Tactical Relay <br>• %ASTROMECH% Astromech <br>• %ILLICIT% Illicit <br>• %DEVICE% Payload <br>• %TITLE% Title <br>• %MODIFICATION% Modification <br>• %CONFIGURATION% Configuration"""
        "WINNING THE GAME":
            name: "Winning the Game"
            text: """The game ends at the end of a round if all of a player’s ships are removed from the game. The player with no ships remaining loses, and the player with at least one ship remaining wins. If both players’ last remaining ships are destroyed in the same round, the game ends in a draw."""
            
            
    faq:
        "ARCS":
            name: "Arcs"
            text: """<strong>Q: Can ships that only use %SINGLETURRETARC% or %FULLFRONTARC% attacks use effects that require the ship to perform a %FRONTARC% attack? (i.e. Fearless, Outmaneuver)</strong> <br><br>A: No. Note the differences between the requirement of Fearless: <br>“While you perform a %FRONTARC% primary attack…” <br>and Punishing One: <br>“While you perform a primary attack, if the defender is in your %FRONTARC%…” <br><br>A %FRONTARC% attack uses the %FRONTARC% icon above the attack value as shown on its ship card. This is different from an attack that is performed against a ship in it’s %FRONTARC%. <br><br><strong>Q: When a ship with its turret arc indicator pointing at its %FRONTARC% performs a %FRONTARC% attack, has it also attacked from that %SINGLETURRETARC%?</strong> <br><br>A: No. For example, if a ship equipped with Veteran Turret Gunner performs a primary %FRONTARC% attack, it could use Veteran Turret Gunner’s ability to perform a %SINGLETURRETARC% attack even if the turret arc indicator is pointing at its %FRONTARC%. <br><br><strong>Q: Is a ship in its own firing arc?</strong> <br><br>A: No. <br><br><strong>Q: Does a ship’s firing arc extend to range 3 even if the weapon using that arc does not?</strong> <br><br>A: Yes. For example, if Drea Renthal (Scum, BTL-A4 Y-wing) is equipped with a Dorsal Turret [%TURRET%], she can use her ability on ships at range 1–3 in her turret arc."""
        "DEPLOYMENT":
            name: "Deployment"
            text: """ <strong>Q: If a ship equipped with Boba Fett [%CREW%] cannot be placed at range 0 of an obstacle and beyond range 3 of any enemy ship, what happens?</strong> <br><br>A: That ship instead defaults to being placed within range 1 of its player’s board edge."""
        "LIST BUILDING":
            name: "List Building"
            text: """ <strong>Q: If a ship equips an upgrade that alters one of its values (such as agility), how does this affect variable cost upgrades?</strong> <br><br>A: Other upgrades are ignored when calculating variable costs, and the base values of the ship are used. <br><br><strong>Q: Can a T-70 X-wing or M-3A Interceptor equip an upgrade that requires multiple slots with its Weapon Hardpoint ship ability (such as Barrage Rockets [%MISSILE% %MISSILE%])?</strong> <br><br>A: No. The Weapon Hardpoint ship ability grants a ship a special upgrade slot that can be used only for one upgrade that exactly matches one of the specified icons (%CANNON%, %TORPEDO%, and %MISSILE%, in this case)."""
        "LOCKING":
            name: "Locking"
            text: """<strong>Q: While locking, can a player not choose an object?</strong> <br><br>A: Yes, but only if there are no valid objects to select. While locking, a player must choose another object at range 0–3 if able. Thus, acquiring a lock can fail if there is no other object at range 0–3, but only fails under this circumstance. <br><br><strong>Q: What happens when two locks from the same ship with an R3 Astromech [%ASTROMECH%] are transferred nto a single ship (such as by Captain Kagi’s [Lambda-class Shuttle] pilot ability)?</strong> <br><br>A: The R3 Astromech only allows having two locks if they are on different ships, so one of the locks breaks if they are transferred to a single ship. <br><br><strong>Q: If an effect instructs a ship to gain an additional lock token (such as Petty Officer Thanisson [%CREW%]), can a player choose to assign the ship a lock token with a different number from the first lock token?</strong> <br><br>A: No. It must gain a lock of the same number as the first (which, in most cases, causes the ship to lose the original lock, resulting in only one lock token)."""
        "OBJECTS":
            name: "Objects"
            text: """ <strong>Q: What does “ignores obstacles” mean? Do Han Solo [Pilot, Customized YT-1300] and Qi’ra [%CREW%] work together? What about Dash Rendar [YT-2400] and Outrider [%TITLE%]?</strong> <br><br>A: When an effect says a ship “ignores obstacles,” it means that ship “ignores the effects of obstacles.” A ship that is “ignoring obstacles” does not apply the effects of overlapping or moving through them. When that ship performs an attack that is obstructed by an obstacle it ignores the effects of the obstruction, so the defender does not roll 1 additional defense die being obstructed by the obstacles the attacker is ignoring. <br><br>However, the obstacles are still treated as being present for effects that check for their presence or absence. Additionally, an attack is obstructed by an obstacle even while the effects of the obstacle are ignored. This applies to cards such as Outrider [%TITLE%], Han Solo [Pilot, Customized YT-1300], and Trick Shot (%TALENT%). <br><br>Additionally, other ships do not ignore the obstacle when resolving effects that interact with a ship that is ignoring obstacles. For instance, while a ship that is ignoring obstacles defends, if the attack is obstructed, it still rolls 1 additional defense die because the attacker is not ignoring the effects of obstacles. <br><br><strong>Q: Does a Mine, when dropped overlapping a ship in the System Phase, detonate immediately?</strong> <br><br>A: Yes. When an object is placed underneath a ship, that ship counts as overlapping that object. <br><br><strong>Q: When a ship moves through a Mine (and overlaps) does the timing window for Sabine Wren [%CREW%] occur before or after the ship has an opportunity to perform an action?</strong> <br><br>A: Trick question! Sabine only affects devices classified as bombs, not mines and other devices, such as a Proximity Mine. <br><br><strong>Q: How do fuse markers (pg. 11) interact with Mines?</strong> <br><br>A: If a ship would move through and/or overlap a fused Mine, one fuse marker is removed from the mine and it does not detonate, even if the ship remains physically on top of the mine after the fuse marker is removed. <br><br>If a ship is physically on top of a mine that did not detonate because of the effect of a fuse marker, and it moves through and/or overlaps that mine again during a later move, the mine detonates as normal. <br><br><strong>Q: If the Loose Cargo from Rigged Cargo Chute [%ILLICIT%] or Spare Parts from Spare Parts Canister [%MODIFICATION%] overlaps another ship, what happens?</strong> <br><br>A: It is placed underneath the ship, and the ship overlaps it, suffering its effects. <strong>Q: If a remote has no arcs, can abilities that resolve “while not in the defender’s %FRONTARC% (or other arc)” resolve?</strong> A: No. A ship cannot be outside of any of a remote’s arcs if that remote has no arcs."""
        "ROLLING AND REROLLING DICE":
            name: "Rolling and Rerolling Dice"
            text: """<strong>Q: If a card such as Saturation Salvo [%TALENT%] instructs a player to reroll “all dice” or a specific number of dice but there are not enough eligible dice, what happens?</strong> <br><br>A: The player rerolls as many eligible dice as possible. <br><br>In the case of Saturation Salvo and similar effects, if a ship uses Saturation Salvo (which rerolls 2 defense dice) against a ship that rolled only 1 defense die, it can still cause that ship to reroll its 1 defense die by resolving the effect as completely as possible (against the 1 eligible defense die). <br><br>Note that if the ship uses Saturation Salvo against a ship that rolled 3 defense dice (for example: %EVADE%, blank, blank), it must choose exactly 2 of those dice to be rerolled, as it must resolve the effect as completely as possible (on 2 eligible dice, in this case). <br><br><strong>Q: Can Han Solo [Pilot, Modified YT-1300]’s ability be used on a die that has been rerolled?</strong> <br><br>A: Yes. Han Solo’s ability is not treated as a reroll, so it can be used on a rerolled die."""
        "DAMAGE CARDS":
            name: "Damage Cards"
            text: """<strong>Q: Does the Wounded Pilot [Damage Card]’s first effect (“After you perform an action, roll 1 attack die. On a %HIT% or %CRIT% result, gain 1 stress token.”) resolve after you repair it?</strong> <br><br>A: No. The card is repaired, and thus has no effect to resolve."""
        "ACTIVATION PHASE AND ACTIONS":
            name: "Activation Phase and Actions"
            text: """<strong>Q: If one effect says to "treat an action as purple" and another says to "treat an action as red," what happens?</strong> <br><br>A: Actions have three difficulties, from least to most restrictive: white, red, and purple. <br><br>If two or more effects would alter the color of an action from its default color, the action is treated as the most restrictive of those colors. So, if an action is "treated as red" and "treated as purple" at the same time, it is treated as purple, as this is the most restrictive. <br><br><strong>Q: If the difficulty of an action is not stated (such as Lando Calrissian [Rebel, %CREW%]’s unique action or the coordinate action “Vizier” [TIE Reaper] can perform as part of its pilot ability), what is the difficulty of that action?</strong> <br><br>A: White. However, note that if a ship is instructed to perform an action “on its action bar” this way, it uses the difficulty of the action on its action bar. <br><br><strong>Q: If a ship has red evade linked to another action (such as the TIE Aggressor or Attack Shuttle), Debris Gambit [%TALENT%] equipped, and is within range of an obstacle, does it treat the linked red evade as white?</strong> <br><br>A: Yes, Debris Gambit modifies any red evade action on the ship’s action bar, including linked actions. <br><br><strong>Q: Can an ionized ship perform an action that is linked to its %FOCUS% action after performing its %FOCUS% action?</strong> <br><br>A: No. An ionized ship is limited to performing only the %FOCUS% action. <br><br><strong>Q: Can an ionized ship that is granted an non-%FOCUS% action after executing a maneuver (such as a Delta-7 Aethersprite using Fine-Tuned Controls to perform an %BARRELROLL% or %BOOST% action, or a TIE Defender using Full Throttle to perform an %EVADE% action) perform that action?</strong> <br><br>A: No. An ionized ship is limited to performing only the %FOCUS% action. <br><br><strong>Q: If a ship attempts a purple action (such as a %BARRELROLL% or %BOOST% action) and fails the action, must it still spend the %FORCE%?</strong> <br><br>A: Yes. A purple action's %FORCE% cost is a "cost to attempt to perform [that] purple action" (see Actions) and is still paid even if the action fails. <br><br><strong>Q: If Anakin Skywalker [Naboo Royal N-1] uses his pilot ability to barrel roll (note that this is not a %BARRELROLL% action) and fails, must he still spend the %FORCE%?</strong> <br><br>A: No. A barrel roll can fail in the same manner as a %BARRELROLL% action, but because Anakin's ability is not an action, the %FORCE% cost is a cost to resolve the effect (which Anakin cannot do in the case of failure) rather than a cost to attempt the action. <br><br><strong>Q: Does Sense [%FORCEPOWER%] require you to spend 1 %FORCE% before measuring range to other ships?</strong> <br><br>A: No. You can measure range to see which ships are at range 0–1 and which ships are at range 0–3 before deciding whether or not to spend the %FORCE% to affect a ship at range 0–3. <br><br><strong>Q: If a Quadrijet Transfer Spacetug uses its "Spacetug Tractor Array" action and cannot choose a ship in its front arc at range 1, what happens?</strong><br><br>A: The action fails.<br><br><strong>Q: While a ship executes a Tallon Roll maneuver, if it cannot be placed at the middle position (center line aligned to the center line of the template), is it able to fully execute the maneuver?</strong> <br><br>A: Yes, provided there is a valid position at which to place it. While executing a Tallon Roll, if a ship can be placed in at least one of the three possible positions (center line aligned to the front, middle, or back of the template), it must choose one of the valid positions, and it fully executes the maneuver. If a valid position exists, it cannot choose an invalid position to partially complete the maneuver. As with a barrel roll, while resolving this, the player may attempt to place the ship at the front, middle, and back before choosing a valid position. <br><br><strong>Q: Can Ved Foslo [TIE Advanced x1] use his ship ability to reduce the speed of a [1 %BANKLEFT%] or [1 %BANKRIGHT%] maneuver, allowing him to execute a [0 %BANKLEFT%] or [0 %BANKRIGHT%] maneuver?</strong> <br><br>A: No. 0-speed bank maneuvers can only be executed by huge ships, and cannot be executed by standard ships even if a particular ship has the ability to execute a maneuver that is not on its dial."""
        "ENGAGEMENT PHASE AND ATTACKING":
            name: "Engagement Phase and Attacking"
            text: """<strong>Q: When a ship is destroyed by a game effect triggered with “before engaging,” does it still engage?</strong> <br><br>A: Yes, because the game has already reached that initiative step, it is not removed until after all ships of that initiative have engaged, per simultaneous fire. <br><br><strong>Q: When specifically during an attack do effects that apply "while you perform an attack" or "while you defend" apply?</strong> <br><br>A: Abilities are applied at the step in the attack at which they take effect. For example, in the case of Predator, as this is a dice modification, it is applied at Step 2b: Modify Attack Dice. Note, however, that effects resolved during Step 2b: Modify Attack Dice and 3b: Modify Defense Dice do not use the ability queue, as they are resolved in the order described in that section of the rules reference. <br><br><strong>Q: If a ship is destroyed, when are effects that trigger upon its destruction resolved?</strong> <br><br>A: If it was destroyed during an attack, these are resolved during Step 6: Aftermath. <br><br>Otherwise, these effects are added to the ability queue immediately (even if the ship would not yet be removed, such as due to the Simultaneous Fire rule or a card effect). <br><br><strong>Q: If a ship is destroyed and an effect such as R1-J5 [%ASTROMECH%] repairs one or more of its damage cards before it is removed, is the ship still destroyed (and thus removed)?</strong> <br><br>A: Yes. After a ship becomes "destroyed" for any reason, it remains destroyed no matter what effects are resolved before it is removed. Effects can change the timing at which a ship is removed, but cannot undo the state of being destroyed."""
        "ABILITIES AND THE ABILITY QUEUE":
            name: "Abilities and the Ability Queue"
            text: """<strong>Q: What makes an effect an "ability?"</strong> <br><br>A: An ability is text from a card a player controls (such a ship card, upgrade card, damage card, remote card, device, condition card, etc). <br><br>A few abilities are constant (such as the "Gain a %FRONTARC% primary weapon with a value of '3'" portion of Moldy Crow). Constant abilities are not resolved via the ability queue. <br><br>Most abilities are triggered, occurring only at a specified timing window (such as the "During the End Phase, do not remove up to 2 focus tokens" portion of Moldy Crow). Triggered abilities are resolved via the ability queue. <br><br>Each triggered ability has the following parts: <br>A timing (when the ability is added to the ability queue) <br>An effect (what the ability does) <br>Additionally, an ability can have one or more of the following: <br>One or more requirements the ship must meet <br>One or more costs the ship must pay <br>A text box can contain multiple abilities if there are multiple constant abilities or triggers that can add an ability to the queue (as in the Moldy Crow example). <br><br><strong>Q: What is meant by a requirement for an ability?</strong> <br><br>A: A requirement for an ability is a conditional if-statement, such as "if you are tractored" or "if the defender is in your bullseye arc." A ship being inarc at range for an attack made as part of a triggered ability, such as Snap Shot or Foresight, is also a requirement for that ability. <br><br>If an ability's requirements are not met at the time the ability would be added to the queue, it cannot be added to the queue. <br><br>If the ability's requirements are not met at the time the ability would be resolved from the queue, the ability is not resolved and is instead removed from the queue. <br><br>If an ability instructs you to make a choice, such as choosing a ship, that is not itself a requirement to initiate an ability. <br><br><strong>Q: When is the cost for an ability paid?</strong> <br><br>A: The cost for an ability is paid when the ability is resolved. An ability cannot be added to the queue if its cost could not be paid at the time it is added. <br><br>If an ability's cost cannot be paid when it would be resolved from the queue, the ability is not resolved and is instead removed from the queue. The ability's cost is not paid. <br><br>An ability can have multiple costs. If it does, all costs must be paid to resolve it. If all costs cannot be paid, no costs are paid and the ability is removed from the queue and not resolved."""
        "SPECIFIC CARD QUESTIONS":
            name: "Specific Card Questions"
            text: """ <strong>Q: Can Cikatro Vizago [%CREW%] exchange an %ILLICIT% upgrade card onto a ship that could not normally equip it (such as equipping a Stealth Device to a Z-95 Headhunter and then exchanging it with a Rigged Cargo Chute on a YV-666)?</strong> <br><br>A: No. Cikatro Vizago cannot move the Rigged Cargo Chute to the Z-95 due to the Z-95 not meeting the “Medium or large ship” restriction on Rigged Cargo Chute, as described in Upgrade Cards. <br><br><strong>Q: When attacking with a weapon with the ordnance icon (such as Proton Rockets) or defending against an attack with the ordnance icon, can Grand Inquisitor [TIE/Advanced v1] apply the range bonus?</strong> <br><br>A: No. <br><br><strong>Q: Is Han Solo [Rebel, %GUNNER%]’s additional attack a bonus attack?</strong> <br><br>A: Yes. Anything that permits an attack outside of the standard attack allowed to a ship when it engages is a bonus attack. <br><br><strong>Q: If a ship with Han Solo [Rebel, %GUNNER%] is made to engage at initiative 7 (through Roark Garnet [HWK-290], Heightened Reflexes [%FORCEPOWER%], etc.), must it perform Han Solo’s bonus attack first?</strong> <br><br>A: Yes. Han Solo [Rebel, %GUNNER%]’s effect occurs at initiative 7 before any ship at that initiative engages (including the one to which Han Solo is equipped), so Han Solo’s bonus attack is always performed first. This means that it cannot perform Han Solo’s bonus attack and then perform a subsequent attack from the same turret arc. <br><br><strong>Q: How do effects that “prevent damage” such as Iden Versio interact with effects such as Ion Cannon and Tractor Beam that “inflict [ion, tractor, jam, etc] tokens instead of dealing damage”?</strong> <br><br>A: If an effect uses %HIT%/CRIT% results for an effect instead of dealing damage (such as inflicting ion, tractor, or jam tokens), that effect cannot be prevented by an effect that “prevents damage.” <br><br>Note that Iden Versio can prevent the 1 damage that an Ion Cannon deals before inflicting ion tokens, but this does not prevent Iden Versio from gaining the subsequent ion tokens. <br><br><strong>Q: When the Nashtah Pup deploys, does it gain charges equal to the charge limit from the ship card with the Hound’s Tooth?</strong> <br><br>A: No, when the Nashtah Pup deploys via emergency deployment, it gains the number of active and inactive charges that the ship with the Hound’s Tooth had before it was destroyed. <br><br><strong>Q: Does the Autopilot Drone [Escape Craft]’s ability trigger if it is destroyed by another method other than running out of charges?</strong> <br><br>A: No. <br><br><strong>Q: If a ship with Cloaking Device [%ILLICIT%] rolls a focus result and then fails while attempting to decloak, what happens?</strong> <br><br>A: The ship does not remove its cloak token. <br><br> strong>Q: Can a ship use Elusive [%TALENT%] to recover charges on other upgrades by fully executing red maneuvers?</strong> <br><br>A: No. Elusive and other effects that refer to recovering charges only apply to the charges of that specific card, unless the effect explicitly states otherwise (such as Chopper [Rebel, Crew]). <br><br><strong>Q: Does Kavil (Scum, BTL-A4 Y-wing) roll an additional attack die when attacking with a turret weapon when the turret arc indicator is set to his front arc?</strong> <br><br>A: Yes. Additionally, note that Kavil would roll an additional attack die when performing an attack that specifies bullseye arc, even though the target is also by definition in his front arc. <br><br><strong>Q: If Lieutenant Sai [Lambda-class Shuttle] coordinates a ship and it performs an action followed by a linked action, can Lieutenant Sai perform the linked action instead of the initial action?</strong><br><br>A: No. Lieutenant Sai can only perform the initial action. <br><br><strong>Q: Airen Cracken [Z-95 Headhunter]’s pilot ability allows another friendly ship to “perform an action, treating it as red.” Can that ship choose to perform a red action, treating it as red? Can it choose to perform a purple action, treating it as red?</strong> <br><br>A: It can perform a red action, treating it as red. However, because purple is more difficult than red, it cannot perform a purple action, treating it as red. <br><br><strong>Q: Does the StarViper-class Attack Platform’s ship ability (Microthrusters) apply to the barrel roll that results from becoming tractored?</strong> <br><br>A: Microthrusters does affect this barrel roll. The player whose effect assigned the tractor token determines the direction and position of the template. <br><br><strong>Q: Do TIE Strikers (and Reapers) skip their perform action step if they overlap an asteroid or another ship with their Aileron’s ability maneuver?</strong> <br><br>A: No. It is only during the Execute Maneuver step that a ship skips its Perform Action step for overlapping a ship or obstacle. <br><br><strong>Q: Can a TIE Advanced x1 that rolled 1 additional die from Advanced Targeting Computer spend the lock later in the attack? If it does, can it change 1 %HIT% into a %CRIT%?</strong> <br><br>A: While performing an attack, a TIE Advanced x1 can spend its lock to reroll attack dice after rolling 1 additional die. <br><br>It can also change 1 %HIT% result to a %CRIT% result and then spend the lock to reroll attack dice. However, note that it cannot change 1 %HIT% result to a %CRIT% result after spending the lock, as it no longer has the defender locked. <br><br><strong>Q: After being destroyed, can “Deathfire” [TIE Bomber] launch a device that cannot normally be launched?</strong> <br><br>A: No. <br><br><strong>Q: If "Deathfire" [TIE Bomber] (or a ship with Paige Tico [%GUNNER%] equipped) placed a device during the System Phase, can that ship drop a bomb after being destroyed?</strong> <br><br>A: Yes. A ship can only place a device once during the System Phase, but it can drop an additional bomb as instructed by its pilot (or upgrade) ability. Note however that some cards that can place devices at times other than the System Phase (such as Edon Kappehl [MG-100 Starfortress] and “Genius” [%ASTROMECH%]) contain the text “If you have not dropped or launched a bomb this round,” which would prevent them from placing a subsequent device if they had placed one in the System Phase. <br><br><strong>Q: What ship’s initiative does Listening Device condition assigned by Informant [%CREW%] trigger at?</strong> <br><br>A: Listening Device’s effect triggers at the initiative of the ship that has the condition. <br><br><strong>Q: If a ship would gain a disarm token as part of paying the cost of an effect, such as Foreman Proach [Modified TIE/ln Fighter] or Quinn Jast [M3-A Interceptor], but Overseer Yushyn [Modified TIE/ln Fighter] causes them to gain a stress token instead, does the effect still resolve?</strong> <br><br>A: Yes. Overseer Yushyn [Modified TIE/ln Fighter]’s ability is a replacement effect, and if it replaces part of the cost a ship would pay to resolve an effect (in this case, the disarm token that ship would gain), that effect still resolves (see page 2, “Paying Costs”). <br><br>Note that abilities that would resolve “after a ship gains a disarm token” still do not resolve, as this is a timing window that has not occurred, rather than a cost that has been replaced. <br><br><strong>Q: If an attack made with Plasma Torpedoes [%TORPEDO%] hits, when does the defender lose a shield?</strong> <br><br>A: It is determined that the attack hit at the end of Step 4: Neutralize Results. Therefore, the ship loses the shield at the end of Step 4: Neutralize Results and before Step 5: Deal Damage. <br><br><strong>Q: What happens if a ship transfers its own lock to itself (such as by using Admiral Holdo [%CREW%])?</strong> <br><br>A: A ship cannot have a lock on itself (see Lock), so that lock breaks. <br><br><strong>Q: When an effect checks the difficulty of your revealed maneuver (such as Cova Nell’s pilot ability), do any effects that alter the difficulty of your maneuvers (such as R4 Astromech [%ASTROMECH%] or Leia Organa [Resistance, %CREW% %CREW%] apply?</strong> <br><br>A: No. The difficulty of a revealed maneuver matches its printed color. The speed and bearing of a revealed maneuver also match their printed value and type, respectively. <br><br><strong>Q: When an effect (such as Seasoned Navigator) instructs a ship to set its dial to a different maneuver "after you reveal your dial," is the ship's revealed maneuver the one that was on the dial when it was revealed or the new maneuver to which it is set?</strong> <br><br>A: The ship's revealed maneuver is the one to which its dial is physically set. If an effect such as Seasoned Navigator physically sets the dial to a new maneuver, the new maneuver is the ship's revealed maneuver. If multiple effects set the dial, the revealed maneuver is the final maneuver on the dial after all effects that set it have been resolved. <br><br><strong>Q: If a ship is affected by Padmé Amidala’s pilot ability and it modifies 1 of its %FOCUS% results, can Emperor Palpatine [%CREW%, Empire]’s ability be used to modify a second %FOCUS% result?</strong> <br><br>A: No. Emperor Palpatine’s ability calls for the die to be modified “as though that ship had spent 1 %FORCE%,” so this ability does not allow for a second modification. <br><br><strong>Q: If an effect applies a maximum to the number of dice rolled (e.g. Seventh Fleet Gunner [%GUNNER%] or Predictive Shot [%FORCEPOWER%]) and another effect instructs it to roll additional dice in excess of this maximum, does the order in which the effects were applied matter?</strong> <br><br>A: No. Once an effect sets a maximum number of dice that can be rolled (“roll 1 additional die, to a maximum of X” or “the defender cannot roll more than X defense dice”), that maximum is applied at Step 2a: Roll Attack Dice or Step 2b: Roll Defense Dice (see Attack) after all effects that cause the ship to roll additional or fewer dice have been applied. <br><br><strong>Q: If a ship with agility 0 (such as the VCX-100) is subject to one effect that would cause it to roll 1 fewer defense die and another effect that would cause it to roll 1 additional defense die, does the order in which these effects are applied change how many defense dice it rolls?</strong> <br><br>A: No. Whichever effect is applied first, it rolls 0 defense dice. If the reduction is applied first, its defense pool becomes “–1 dice” (negative 1 defense dice), then the positive modifier is applied, bringing it back to 0. On the other hand, if the increase is applied first, the decrease subsequently reduces it back to 0. <br><br>Note that after modifiers are applied but before dice are rolled, there is a default minimum of 0 dice (see Attack). Therefore if a ship would roll fewer than 0 dice due to the modifiers that have been applied, it always rolls 0 defense dice instead. <br><br><strong>Q: If a ship with agility 0 (such as the VCX-100) is strained and defends against an attack at attack range 1 (for which it would normally roll 0 defense die), does it remove the strain token?</strong> <br><br>A: Yes. Although it cannot be made to roll fewer than 0 defense dice due to the intrinsic minimum, the effect of “roll 1 fewer defense die” is applied (see Attack), and so the strain token is removed. <br><br><strong>Q: If a ship that is equipped with Kanan Jarrus [Crew] uses Inertial Dampeners [Illicit] to perform a white stationary maneuver, in which order to Kanan's ability and the "gain 1 stress token" portion of Inertial Dampeners' ability occur?</strong> <br><br>A: Both abilities have the same timing window: after the ship executes the maneuver. Thus, after the ship executes the white stationary maneuver, if the player chooses to spend one Force charge to activate Kanan, two abilities enter the ability queue: Inertial Dampeners' "gain 1 stress token" and Kanan Jarrus' "remove 1 stress token." The player who controls both effects determines the order they enter the queue, and then the abilities resolve in that order. If a player wants the ship to gain and then remove a stress token, Inertial Dampeners' ability should be placed into the queue before Kanan's ability. <br><br><strong>Q: Dalan Oberos [M12-L Kimogila]'s pilot ability reads "At the start of the Engagement Phase, you may choose 1 shielded enemy ship in your bullseye arc and spend 1 charge. If you do, that ship loses 1 shield and you recover 1 shield." Must both "that ship loses 1 shield" and "you recover 1 shield" be able to resolve for either to resolve?</strong> <br><br>A: Yes. "That ship loses 1 shield and you recover 1 shield" is a single effect, and so both parts must be able to resolve for either to occur. <br><br><strong>Q: Do Paige Tico [%GUNNER%] and "Deathfire" [TIE Bomber]'s abilities supersede the "one device per round" limitation?</strong> <br><br>A: Yes. These abilities allow one ship to drop a second device in the same round (at the relevant timing windows), as they do not include the "if you have not dropped or launched a device this round" limitation (as included on Edon Kappehl). <br><br><strong>Q: If an effect says that a ship "loses a shield" (or "loses shields"), has that ship suffered damage?</strong> <br><br>A: No. While suffering damage does cause a ship to lose shields (if applicable), if an effect causes a ship to lose one or more shields directly, it has not suffered damage. <br><br><strong>Q: How is Han Solo [Rebel, Modified YT-1300]'s ability categorized? Is it a dice modification? Is it a reroll? What is its timing window?</strong> <br><br>A: Han Solo's ability is treated as a dice modification effect that is not a reroll. Because it is a dice modification effect, when attacking or defending, it triggers during the Modify Dice step. Note, however, that it can also affect other die rolls, such as the roll to determine if a ship suffers damage from overlapping or moving through an asteroid. <br><br><strong>Q: How does Han Solo [Rebel, Modified YT-1300]'s ability interact with C-3PO [Rebel, Crew]?</strong> <br><br>A: The "if you do and you roll exactly that many evade results..." portion of C-3PO's ability triggers occurs after the dice are rolled, before the Modify Dice step. Thus, Han Solo's effect occurs after C-3PO's effect has been resolved. If using Han Solo after using C-3PO, the added die must be rerolled. <br><br><strong>Q: How does Han Solo [Rebel, Modified YT-1300]'s ability interact with "Midnight" [TIE/fo Fighter]?</strong> <br><br>A: "Midnight" prevents dice modification. Because Han Solo's ability is a dice modification effect, "Midnight" prevents it from being used. <br><br><strong>Q: If a ship executes a stationary maneuver in arc at range 2 of an enemy ship with Snap Shot equipped (or in the bullseye arc of an enemy ship with Foresight equipped), can the ship with Snap Shot (or Foresight) perform the bonus attack?</strong> <br><br>A: Yes. <br><br><strong>Q: While "Scourge" Skutu performs an attack using Snap Shot, if the defender is in "Scourge" Skutu's bullseye arc, does "Scourge" Skutu add an additional attack die?</strong> <br><br>A: Yes. <br><br><strong>Q: If a ship with the Fine-Tuned Controls ship ability (or another ability that triggers "after you execute/fully execute a maneuver") fully executes a maneuver in arc at range 2 of a ship equipped with Snap Shot, how is this resolved?</strong> <br><br>A: This is resolved one of several ways depending on which player is first player. <br><br>In all cases, both abilities ("After you fully execute a maneuver, you may spend 1 force charge to perform a boost or barrel roll action" and "After an enemy ship executes a maneuver, you may perform this attack against it as a bonus attack") are added to the ability queue. <br><br>If the first player controls the ship with Fine-Tune Controls, that player resolves this ability before Snap Shot is resolved. If, after performing a boost or barrel roll, the ship with Fine-Tuned Controls is no longer in range or arc to be chosen as a target for Snap Shot, Snap Shot cannot be resolved and is removed from the queue. <br><br>If the second player controls the ship with Fine-Tuned Controls, their opponent resolves Snap Shot first. <br><br><strong>Q: How do abilities that alter the speed, difficulty, and/or bearing of a maneuver that a ship reveals during its Reveal Dial step and executes during its Execute Maneuver step resolve? For example, if Hera Syndulla [Attack Shuttle] is equipped with R4 Astromech and Seasoned Navigator, and also has the Damaged Engine Damage Card, what happens?</strong> <br><br>A: R4 Astromech and Damaged Engine (and other constant effects that alter the difficulty of a maneuver, such as Nien Nunb [Crew], L3-37's Programming, and Leia Organa [Rebel and Resistance, Crew]) apply only during the Execute Maneuver step and for effects that trigger after that ship executes a maneuver. <br><br>So, after Hera's dial is revealed, Hera's player may add Hera's pilot ability and Seasoned Navigator's ability to the ability queue in either order. Both abilities resolve, and if Seasoned Navigator's ability is resolved, the difficulty of the maneuver is increased during the Execute Maneuver step (i.e. the difficulty has not yet been increased when Hera's pilot ability is resolved). <br><br>Then, during the Execute Maneuver step, all abilities that alter the difficulty of the maneuver are cumulative as normal. <br><br>Note that abilities that alter a maneuver without causing the ship to select a new maneuver on its dial do not affect the ship's "revealed maneuver" as referenced by abilities such as Ric Olié's pilot ability. <br><br><strong>Q: After a Nantex-class starfighter executes its maneuver, if it uses its Pinpoint Tractor Array ship ability to assign a tractor token to itself so that it can rotate its turret arc, and then it barrel rolls itself over a debris field as a result of becoming tractored, giving it a stress token, how does this resolve?</strong> <br><br>A: After a Nantex-class starfighter executes its maneuver, it has the option to add an ability in the queue with the effect of "gain 1 tractor token to perform a %ROTATEARC% action." <br><br>When this ability resolves, the Nantex-class starfighter pays the cost ("gain 1 tractor token") to resolve this effect. The Nantex-class starfighter gains 1 tractor token, then performs the rotate action. Note that it does not resolve the game effect of becoming tractored (which triggers after the first time a ship becomes tractored each round) until after it fully resolves the ability by completing the rotate action. <br><br>Once the ability is fully resolved, the game effect that triggers after a ship becomes tractored is applied to the Nantex-class starfighter (before any other abilities on the queue are resolved), prompting the Nantex-class starfighter's player to move it, if they desire. If they do and this movement takes the Nantex-class starfighter onto a debris cloud, it resolves the effects of moving through or overlapping the debris cloud, including gaining 1 stress token. <br><br>Finally, any other abilities on the queue are then resolved in order. <br><br><strong>Q: Can Snap Shot or Foresight be chosen as a special weapon to be used for a ship's attack during the Engagement Phase?</strong> <br><br>A: Yes. The phrase "after an enemy ship executes a maneuver, you may perform this attack against it as a bonus attack" allows the attack to be used as a bonus attack under the specified circumstances, but does not disqualify it from being used during the Engagement Phase. <br><br><strong>Q: Do abilities that reference upgrades of a specific type (such as Captain Jonus' pilot ability) affect upgrades with multiple types including that type?</strong> <br><br>A: Yes. For example, Captain Jonus' pilot ability can be used with a friendly ship's Barrage Rockets [%MISSILE% %MISSILE%], and Paige Tico [%GUNNER%]'s ability can be used with Electro-Proton Bomb [%DEVICE% %MODIFICATION%]. Each of these upgrades has the qualifying type (%MISSILE% for Barrage Rockets and %DEVICE% for Electro-Proton Bomb) in addition to its other type. <br><br>Note that the Weapon Hardpoint ability does not behave this way, as it grants a special upgrade slot. <br><br><strong>Q: When searching for a damage card with Kaz's Fireball [%TITLE%], must you show that card to your opponent?</strong> <br><br>A: No. You are not required to show the card to your opponent. <br><br><strong>Q: Can a Fireball use its "Explosion with Wings" ship ability without any facedown damage card to pay the cost of "exposing 1 damage card" to resolve the effect of "remov[ing] 1 disarm token"?</strong> <br><br>A: No. As exposing a damage card is a cost for removing the damage card, if the cost cannot be payed, the effect cannot be resolved. <br><br><strong>Q: If "Rush" becomes damaged during the Engagement Phase before the initiative 2 step, causing its initiative to become "6", what happens?</strong><br><br>A: "Rush" engages at the current initiative step, after all other ships at thatstep have engaged."""
