from pprint import pprint

def calculate_ratios(crankset, cassette):
    gear_ratios = []
    cassette.sort(reverse=True)
    crankset.sort()
    for chainring in crankset:
        temp_ratios = []
        for sprocket in cassette:
            temp_ratios.append(sprocket)
        gear_ratios.append([chainring, temp_ratios])

    ratios = []
    for ratio in gear_ratios:
        temp_ratios = []
        for sprocket in ratio[1]:
            math_ratio = ratio[0] / sprocket
            temp_ratios.append(round(math_ratio, 2))
        ratios.append(temp_ratios)
    return ratios

def calculate_rollouts(crankset, cassette, tyre):
    ratios = calculate_ratios(crankset, cassette)
    rollouts = []
    for chainring in ratios:
        temp_rollouts = []
        for ratio in chainring:
            rollout = ratio * tyre
            temp_rollouts.append(rollout)
        rollouts.append(temp_rollouts)
    return rollouts

def calculate_speeds(crankset, cassette, tyre, cadences):
    rollouts = calculate_rollouts(crankset, cassette, tyre)
    speeds = []
    for rollout_group in rollouts:
        for rollout in rollout_group:
            speed_group = []
            for cadence in cadences:
                speed = (rollout * cadence) / 16670
                speed_group.append(speed)
            speeds.append(speed_group)
    return speeds 


crankset = [52,36]
cassette = [11,12,13,14,15,16,17,19,21,24,27,30]
tyre = 2198
cadences = [60,70,80,90,100]
