import sys
import requests
import json
from collections import defaultdict


import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

city_list = sys.argv[1:]

url = "https://partners.api.skyscanner.net/apiservices/v3/flights/indicative/search"

#locale = "es-ES"
locale = "en-GB"
url_entityId = f"https://partners.api.skyscanner.net/apiservices/v3/geo/hierarchy/flights/{locale}"

api_key = "sh969210162413250384813708759185"

headers = {
    "x-api-key": api_key,
    "Content-Type": "application/json"
}


response_entityId = requests.get(url_entityId, headers=headers)
data = response_entityId.json()

#print(data)

cities = data['places']

#print(list(data['places'].values())[0])

#print(cities)

# for c in cities.values():
#     if c["type"] == 'PLACE_TYPE_CITY':
#         has_airport = []
#         for o in cities.values():
#             if o["type"] == 'PLACE_TYPE_AIRPORT' and o["parentId"] == c["entityId"]:
#                 has_airport.append(o)
#         if len(has_airport) == 0:
#             print("CIUDAD SIN AEROPUERTO: ", c)

def search_city_entityId(city_name,country_name):
    result = []
    for c in cities.values():
        if c["type"] != 'PLACE_TYPE_ISLAND':
            if city_name.lower() in c["name"].lower():
                if c["type"] == 'PLACE_TYPE_COUNTRY':
                    result.append(c["entityId"])
                else:
                    parent = cities[c["parentId"]]
                    type_parent = parent["type"]
                    while type_parent != "PLACE_TYPE_COUNTRY":
                        if parent["parentId"] == '':
                            print("No parentId")
                            break
                        parent = cities[parent["parentId"]]
                        type_parent = parent["type"]
                    if parent["parentId"] == '':
                        print("No parentId")
                        continue
                    if country_name.lower() in parent["name"].lower():
                        result.append(c["entityId"])
    if len(result) == 1:
        if cities[result[0]]["type"] == "PLACE_TYPE_CITY":
            return result[0]
        else:
            return None
    elif len(result) == 0:
        return None
    else:
        result_city = [c for c in result if cities[c]["type"] == 'PLACE_TYPE_CITY']
        if len(result_city) == 1:
            return result_city[0]
        else:
            return None

#print(search_city_entityId('rome','italy'))
#print(search_city_entityId("Cape Town","South Africa"))
#print(search_city_entityId('Barcelona','Spain'))

def get_query(origin_entityId,dest_entityId):
    data = {
        "query": {
            "market": "UK",
            "locale": "en-GB",
            "currency": "GBP",
            "queryLegs": [
                {
                    "originPlace": {
                        "queryPlace": {
                            "entityId": origin_entityId
                        }
                    },
                    "destinationPlace": {
                        "queryPlace": {
                            "entityId": dest_entityId
                        }
                    },
                    "anytime": True
                }
            ]
        }
    }
    return data


#data = get_query(search_city_entityId("Tenerife","Spain")[0],search_city_entityId("Barcelona","Spain")[0])
#print(data)

#response = requests.post(url, headers=headers, json=data)
# print(response.status_code)
#print(dir(response))
#data = response.json()

#print(list(data['content']['results']["quotes"].values()))

def get_min_price(data):
    quotes = data["content"]["results"]["quotes"]
    if quotes:
        precios = [float(quote["minPrice"]["amount"]) for quote in quotes.values()]
        return min(precios)
    else:
        return "No flights found"

#print("MinPrice is: ", get_min_price(data))



def get_price_by_dest(origin_list,destination):
    entityId_dest = search_city_entityId(destination[0],destination[1])
    if entityId_dest is None:
        return dict()
    result = dict()
    result[destination[0]+", "+destination[1]] = dict()
    for city in origin_list:
        data = get_query(city,entityId_dest)
        response = requests.post(url, headers=headers, json=data)
        data = response.json()
        min_price = get_min_price(data)
        if type(min_price) != str:
            result[destination[0]+", "+destination[1]][city] = get_min_price(data)
        else:
            return dict()
    return result


#print("Precio medio del destino: ", get_price_by_dest(['128667316'],("valencia","spain")))

def get_all_prices(origin_list,destination_list):
    result_all_dest = dict()
    for destination in destination_list:
        prices_dest = get_price_by_dest(origin_list, destination.split(', '))
        result_all_dest = result_all_dest | prices_dest
    return result_all_dest


######################################################################################

def min_max_scale(scores):
    min_score = min(scores.values())
    max_score = max(scores.values())
    range_score = max_score - min_score if max_score != min_score else 1  # avoid division by 0
    return {dest: (score - min_score) / range_score for dest, score in scores.items()}


def calculate_new_scores(standardized_scores, normalized_by_origin, origin_names_and_budget_tolerance):
    new_scores = defaultdict(dict)
    for origen, budget_tolerance in origin_names_and_budget_tolerance.items():
        for destino, score in standardized_scores.items():
            
            # get the normalized budget for the destination
            normalized_budget = normalized_by_origin[origen].get(destino, 0)
            # calculate the new score
            new_score = (score) + (budget_tolerance * normalized_budget)
            new_scores[origen][destino] = new_score
    return new_scores


def rank_destinations(new_scores):
    ranked_destinations = {}
    for origen, scores in new_scores.items():
        # sort the destinations by score
        sorted_destinations = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        # assign ranks from n to 1 (where n is the number of destinations)
        ranked_destinations[origen] = {dest: len(sorted_destinations) - rank for rank, (dest, _) in enumerate(sorted_destinations)}
    return ranked_destinations



def calculate_borda_count(ranked_destinations):
    borda_count = {}
    for origin, scores in ranked_destinations.items():
        for destination, score in scores.items():
            if destination not in borda_count:
                borda_count[destination] = 0
            borda_count[destination] += score
    return borda_count


def rank_destinations_by_borda_count(borda_count):
    sorted_destinations = sorted(borda_count.items(), key=lambda x: x[1], reverse=True)
    return sorted_destinations



def main_program(scores: dict[str: int], budgets: dict[str,int]):
    # input = ' '.join(sys.argv[1:])  # sys.argv[0] es el nombre del script
    origin_names_and_budget_tolerance = budgets
    destination_scores = scores
    print(origin_names_and_budget_tolerance)
    print(destination_scores)
    destination_budgets = get_all_prices(origin_names_and_budget_tolerance.keys(),destination_scores.keys())
    print(destination_budgets)


    ################################################################################

    standardized_scores = min_max_scale(destination_scores)

    budgets_by_origin = defaultdict(dict)
    for dest, origenes in destination_budgets.items():
        for origen, precio in origenes.items():
            budgets_by_origin[origen][dest] = precio

    # Paso 2: aplicar min-max por origen
    normalized_by_origin = {}
    for origen, destinos in budgets_by_origin.items():
        precios = list(destinos.values())
        min_p = min(precios)
        max_p = max(precios)
        rango = max_p - min_p if max_p != min_p else 1  # evitar división por 0
        normalized_by_origin[origen] = {
            dest: 1-((precio - min_p) / rango)
            for dest, precio in destinos.items()
        }

    new_scores = calculate_new_scores(standardized_scores, normalized_by_origin, origin_names_and_budget_tolerance)
    ranked_destinations = rank_destinations(new_scores)
    borda_count = calculate_borda_count(ranked_destinations)
    ranked_destinations_final = rank_destinations_by_borda_count(borda_count)

    print(ranked_destinations_final)

    top3 = [nombre for nombre, _ in sorted(ranked_destinations_final, key=lambda x: x[1], reverse=True)[:3]]


    prompt = f'''
    
You are a travel assistant helping a group choose between several potential
 travel destinations. Given a list of cities and the group’s specific interests,
   write a detailed and engaging description for each city. Each description should help
     the group imagine what a vacation there would be like, highlighting what makes the
       city unique and what types of activities or experiences they can expect—specifically 
       tailored to their interests.

       The descriptions must be:

Specific and vivid.

Focused on tourism (landmarks, food, culture, nature, etc.).

Adapted to the interests of the group (e.g. food, nature, nightlife, history, art, sports).

Written in an informative yet engaging tone.

Return the output as a JSON object with this exact structure (THE OUTPUT MUST ONLY CONTAIN THE JSON AND NO OTHER INFORMATION):
{{
  "destination_name1": "description"
  "destination_name2": "description"
  "destination_name3": "description"
}}
Make the description VERY schematic (point by point), eye catching and engaging, make special emphasis on justifing your city choices with the group and individual interests.


Input:

List of destinations:

[{top3}]

Group interests:

    '''
    return prompt