import sys
import requests
import json

import sys
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
            return "No city found"
    elif len(result) == 0:
        return "No city found"
    else:
        result_city = [c for c in result if cities[c]["type"] == 'PLACE_TYPE_CITY']
        if len(result_city) == 1:
            return result_city[0]
        else:
            return "Mas de una ciudad en el mismo pais con el mismo nombre"

#print(search_city_entityId('tenerife','spain'))
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
    result = dict()
    for city in origin_list:
        print(f"Origin: {city}. Destination: {entityId_dest}")
        data = get_query(city,entityId_dest)
        response = requests.post(url, headers=headers, json=data)
        data = response.json()
        min_price = get_min_price(data)
        if type(min_price) != str:
            result[destination[0]+", "+destination[1]] = get_min_price(data)
        else:
            return dict()
    return result


print("Precio medio del destino: ", get_price_by_dest(['128667316'],("Tokyo","Japan")))

def get_all_prices(origin_list,destination_list):
    result_all_dest = dict()
    for destination in destination_list.keys():
        prices_dest = get_price_by_dest(origin_list, destination.split(', '))
        result_all_dest = result_all_dest | prices_dest
    return result_all_dest


if __name__ == "__main__":
    input = ' '.join(sys.argv[1:])  # sys.argv[0] es el nombre del script
    print(type(input.split(";")[0]))
    print(type(input.split(";")[1]))
    origins = json.loads(input.split(";")[0])
    destinations = json.loads(input.split(";")[1])
    result_all_dest = get_all_prices(origins.keys(),destinations.keys())
    print(result_all_dest)

