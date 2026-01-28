<template>
    <!-- <div class="title-container">
        <img src="../../public/images/logo_large.png" alt="Optic View" style="width: 10rem;"/>
    </div>
    <div class="container">
        <h1>Optic View</h1>
    </div> -->

    <Panel class="container">
    <template #header>
        <div class="flex items-center gap-2">
            <img src="../../public/images/logo_large.png" alt="Optic View" style="width: 10rem; margin-left: 5rem; margin-top: 1rem;"/>
        </div>
    </template>
    <Divider />
    <Splitter style="height: calc(100vh - 14rem);">
    <SplitterPanel :minSize="30" :size="30" class="flex flex-col p-0">
        <div class="w-full flex items-center justify-evenly p-3 border-b surface-border">
            <div class="flex items-center gap-2">
                <ToggleSwitch v-model="num_patients_check" />
                <label class="font-medium"># patients</label>
            </div>
            <div class="flex items-center gap-2">
                <ToggleSwitch v-model="hr_check" />
                <label class="font-medium">HR (95% CI)</label>
            </div>
            <div class="flex items-center gap-2">
                <ToggleSwitch v-model="ae_check" />
                <label class="font-medium">AE rate (p-values)</label>
            </div>
        </div>
        <div class="flex-1 overflow-auto p-3">
            <!-- Content -->
        </div>
    </SplitterPanel>
    <SplitterPanel :minSize="40" class="flex items-center justify-center"> Panel 2 </SplitterPanel>
</Splitter>
</Panel>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as XLSX from 'xlsx'
const num_patients_check = ref(true)
const hr_check = ref(true)
const ae_check = ref(true)
const trial_data = ref(null)

onMounted(async () => {
    try {
        const response = await fetch('/data/data_OPTIC.xlsx');
        const buffer = await response.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const results_worksheet = workbook.Sheets["results"]
        const results_rows = results_worksheet ? XLSX.utils.sheet_to_json(results_worksheet, { defval: null }) : []
        const groupedData = results_rows.reduce((acc, row) => {
            const name = row["trial_name"];
            if (!acc[name]) {
                acc[name] = {
                    trial_name: name,
                    macro_data: [],
                    detailed_data: {}
                };
            }
            // collect macro data
            acc[name].macro_data.push({
                method_name: row["method"],
                num_criteria: row["number_of_criteria"],
                num_patients: row["number_of_patients"],
                hr: row["hr_ci"].split(" ")[0],
                ci: "(" + row["hr_ci"].split("(")[1],
                ae_rate: row["ae"],
                p_value: row["p_value"]
            });
            return acc;
        }, {});

        trial_data.value = Object.values(groupedData);
        // then collect detailed data
        // first, get each sheet
        const trial_worksheet = workbook.Sheets["trials"]
        const trial_rows = trial_worksheet ? XLSX.utils.sheet_to_json(trial_worksheet, { defval: null }) : []
        const trial_criteria_sheet = workbook.Sheets["trial_criteria"]
        const trial_criteria_rows = trial_criteria_sheet ? XLSX.utils.sheet_to_json(trial_criteria_sheet, { defval: null }) : []
        const criteria_sheet = workbook.Sheets["criteria"]
        const criteria_rows = criteria_sheet ? XLSX.utils.sheet_to_json(criteria_sheet, { defval: null }) : []
        trial_data.value.forEach(item => {
            const cancer_type = trial_rows.find(row => row["trial_name"] === item.trial_name)?.cancer_type
            const match = cancer_type ? cancer_type.match(/\(([^)]+)\)/) : null
            const cancer_short_name = match ? match[1] : cancer_type
            const line_of_treatment = trial_rows.find(row => row["trial_name"] === item.trial_name)?.line_of_therapy
            const treatment = trial_rows.find(row => row["trial_name"] === item.trial_name)?.treatment
            const control = trial_rows.find(row => row["trial_name"] === item.trial_name)?.control.replace('/', ' or ').replace(' + ', ' and ')
            const elegible_criteria = trial_criteria_rows
                .filter(row => row["trial_name"] === item.trial_name)
                .map(row => {
                    const criteria_detail = criteria_rows.find(c => c["criteria_name"] === row["criteria_name"]);
                    return {
                        criteria_name: row["criteria_name"],
                        criteria_description: criteria_detail ? criteria_detail["criteria_description"] : "",
                        type: criteria_detail ? criteria_detail["type"] : null,
                        color: row["OPTIC+ (red)"] ? 'red' : (row["OPTIC (grey)"] ? 'grey' : null)
                    }
                })
            item.detailed_data = {
                cancer_type: cancer_type,
                cancer_short_name: cancer_short_name,
                endpoint:"Overall Survival",
                line_of_treatment: line_of_treatment,
                treatment: treatment,
                control: control,
                elegible_criteria:elegible_criteria
            };
        });
        console.log("Processed Data:", trial_data.value);
    } catch (error) {
        console.error("Error reading Excel file:", error);
    }
})
</script>

<style scoped>
.container {
    margin: 1rem;
    width: 100%;
    max-width: calc(100% - 2rem);
}
</style>