from collections import defaultdict

#d1 d2 d3 are destination names
# o1 o2 o3 are origin names

# a score for each destination
destination_scores = {'d1': 10, 'd2': 7, 'd3': 4, 'd4': 1, 'd5': 8, 'd6': 5, 'd7': 5, 'd8':7, 'd9': 9, 'd10': 10}

# normalize the scores with min-max scaling
def min_max_scale(scores):
    min_score = min(scores.values())
    max_score = max(scores.values())
    range_score = max_score - min_score if max_score != min_score else 1  # avoid division by 0
    return {dest: (score - min_score) / range_score for dest, score in scores.items()}


standardized_scores = min_max_scale(destination_scores)

print(standardized_scores)
# the budget for each destination from each origin (Funcion del Navarro)
destination_budgets = {
    'd1': {'o1': 1000, 'o2': 1200, 'o3': 800},
    'd2': {'o1': 1500, 'o2': 1300, 'o3': 900},
    'd3': {'o1': 2000, 'o2': 1800, 'o3': 1200},
    'd4': {'o1': 2500, 'o2': 2200, 'o3': 1600},
    'd5': {'o1': 3000, 'o2': 2700, 'o3': 2000},
    'd6': {'o1': 3500, 'o2': 3200, 'o3': 2400},
    'd7': {'o1': 4000, 'o2': 3700, 'o3': 2800},
    'd8': {'o1': 4500, 'o2': 4200, 'o3': 3200},
    'd9': {'o1': 5000, 'o2': 4700, 'o3': 3600},
    'd10': {'o1': 5500, 'o2': 5200, 'o3': 4000},
}   

origin_names_and_budget_tolerance = {'o1': 0.2, 'o2': 0.2, 'o3': 0.2}

#min_max scale the budgets for each origin, so we can use them as a score
# Paso 1: reorganizar datos: origen -> destino -> precio
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

# for each origin, get a dictionary with the destination names and the following new_score = (old_score*budget_tolerance + (1-budget_tolerance)*min_max_scale(destination_budgets))
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

new_scores = calculate_new_scores(standardized_scores, normalized_by_origin, origin_names_and_budget_tolerance)
# now for each origin, we sort the destinations by the new_score and change the scores to 1-n, where the first one is n (the number of destinations), the second one is n-1, etc.

def rank_destinations(new_scores):
    ranked_destinations = {}
    for origen, scores in new_scores.items():
        # sort the destinations by score
        sorted_destinations = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        # assign ranks from n to 1 (where n is the number of destinations)
        ranked_destinations[origen] = {dest: len(sorted_destinations) - rank for rank, (dest, _) in enumerate(sorted_destinations)}
    return ranked_destinations


ranked_destinations = rank_destinations(new_scores)

# now we make a final dictionary with the destination names and the agregate score for each destination, which is the Borda Count from each origin
# the Borda Count is the sum of the ranks for each destination, so we can use a dictionary comprehension to do it

def calculate_borda_count(ranked_destinations):
    borda_count = {}
    for origin, scores in ranked_destinations.items():
        for destination, score in scores.items():
            if destination not in borda_count:
                borda_count[destination] = 0
            borda_count[destination] += score
    return borda_count


borda_count = calculate_borda_count(ranked_destinations)

# now we sort the destinations by the Borda Count and change the scores to 1-10, where the first one is 10, the second one is 9, etc.
def rank_destinations_by_borda_count(borda_count):
    sorted_destinations = sorted(borda_count.items(), key=lambda x: x[1], reverse=True)
    return sorted_destinations


ranked_destinations_by_borda_count = rank_destinations_by_borda_count(borda_count)


import pprint
pprint.pprint(ranked_destinations_by_borda_count)
