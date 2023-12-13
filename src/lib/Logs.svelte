<script>
    import { animationTime, logs, pathChanger } from "../db.js";
    // @ts-ignore
    import { fade, fly } from "svelte/transition";

    let logsShown = false;
    let earliestDay = -9;
    let earliestMonth = -9;
    let earliestYear = -9;

    function isNewDay(num) {
        let date = new Date(num);

        // return the date if it is a different day
        let day = date.getDate();
        let month = date.getMonth();
        let year = date.getFullYear();
        if (
            month != earliestMonth ||
            day != earliestDay ||
            year != earliestYear
        ) {
            earliestDay = day;
            earliestMonth = month;
            earliestYear = year;
            return true;
        }
        return false;
    }

    function getDay(num) {
        let date = new Date(num);
        let time = date.toLocaleString("en-US", { timeZoneName: "short" });

        return time.split(", ")[0];
    }

    function numberToTime(num) {
        let date = new Date(num);
        let utcTime = date.toLocaleString("en-US", { timeZoneName: "short" });

        let time = utcTime.split(", ")[1].split(":").slice(0, 2).join(":");
        let ampm = date
            .toLocaleString("en-US", { timeZoneName: "short" })
            .split(" ")[2];

        return time + " " + ampm;
    }

    function toggleLogs() {
        logsShown = !logsShown;
        // scroll to the bottom of the logs
        if (logsShown) {
            setTimeout(() => {
                // @ts-ignore
                let logs = document.getElementById("logs");
                logs.scrollTop = logs.scrollHeight;
            }, 5);
        }
    }

    function decodeProductName(name) {
        let decodedName = name;
        for (let i = 0; i < Object.keys(pathChanger).length; i++) {
            decodedName = decodedName.replaceAll(
                Object.values(pathChanger)[i],
                Object.keys(pathChanger)[i]
            );
        }
        return decodedName;
    }

    function logInfoToMessage(info) {
        let type = info.type;
        if(info.name){
            info.name = decodeProductName(info.name);
        }
        if(info.newName){
            info.newName = decodeProductName(info.newName);
        }
        if(info.part){
            info.part = decodeProductName(info.part);
        }
        if (type == "member added") {
            return `${info.userEmail} added ${info.member} to the organization`;
        } else if (type == "member ranked") {
            return `${info.userEmail} ranked ${info.member} to ${info.rank}`;
        } else if (type == "member removed") {
            return `${info.userEmail} removed ${info.member} from the organization`;
        } else if (type == "team added") {
            return `${info.userEmail} created ${info.team}`;
        } else if (type == "team removed") {
            return `${info.userEmail} removed ${info.team}`;
        } else if (type == "edit custom part name") {
            return `${info.userEmail} renamed ${info.name} to ${info.newName}`;
        } else if (type == "edit custom part sku") {
            return `${info.userEmail} changed ${info.name}'s sku from ${info.sku} to ${info.newSku}`;
        } else if (type == "edit custom part image") {
            return `${info.userEmail} changed ${info.name}'s image`;
        } else if (type == "edit custom part count") {
            return `${info.userEmail} changed ${info.name}'s count from ${info.count} to ${info.newCount}`;
        } else if (type == "delete custom part") {
            return `${info.userEmail} deleted ${info.name}`;
        } else if (type == "add part") {
            return `${info.userEmail} added ${info.count} ${info.part} to ${info.team}`;
        } else if (type == "remove product") {
            return `${info.userEmail} removed ${info.count} ${info.part} from ${info.team}`;
        } else if (type == "transfer product") {
            return `${info.userEmail} transferred ${info.count} ${info.part} from ${info.team} to ${info.newTeam}`;
        } else {
            return "Unknown log type. Please email 15442C@gmail.com if you see this.";
        }
    }
</script>

<button
    id="viewLogs"
    in:fly={{ x: 100, duration: $animationTime / 2 }}
    out:fly={{ x: 100, duration: $animationTime / 2 }}
    on:click={toggleLogs}
    on:keypress={toggleLogs}>View Logs</button
>

{#if logsShown}
    <div
        id="logs"
        in:fly={{ x: 100, y: 100, duration: $animationTime }}
        out:fly={{ x: 100, y: 100, duration: $animationTime }}
    >
        {#key $logs}
            {#each Object.keys($logs) as time, i}
                {#if isNewDay(Number(time))}
                    <p class="time">{getDay(Number(time))}</p>
                {/if}
                <div class="log">
                    <p class="log">{numberToTime(Number(time))}</p>
                    <p class="log">{logInfoToMessage($logs[time])}</p>
                </div>
            {/each}
        {/key}
    </div>
{/if}

<style>
    #logs {
        position: absolute;
        left: 27vw;
        top: 23vh;
        width: 65vw;
        height: 64vh;
        /* background-color: rgb(255, 74, 74); */
        background-color: black;
        color: white;
        border-radius: 10px;
        overflow-y: auto;
        overflow-x: hidden;
        z-index: 1;
    }

    .time {
        position: sticky;
        top: 0;
        background: black;
        border: white solid 1px;
        margin-left: 6px;
        margin-right: 6px;
        z-index: 2;
        border-radius: 10px;
    }

    .log {
        width: 65vw;
        border-top: white solid 1px;
    }

    .log p {
        border-top: 0;
        width: 60vw;
        padding-left: 1vw;
    }

    #viewLogs {
        position: absolute;
        left: 69vw;
        top: 91.5vh;
        width: 29vw;
        height: 7vh;
        color: white;
        background-color: #007bff;
        transition: background-color 0.125s ease-in-out;
        text-align: center;
        padding: 0;
        cursor: pointer;
    }

    #viewLogs:hover {
        background-color: #0056b3;
        transition: background-color 0.125s ease-in-out;
    }
</style>
