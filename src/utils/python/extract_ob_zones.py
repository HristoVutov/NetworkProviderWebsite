import pandas as pd
import numpy as np
from smartmoneyconcepts.smc import smc
import sys
import json

def add_ob_summary(df, ob_data, label_prefix):
    """
    Builds and returns a text summary of OB zones.
    Zones with OB value 1 are considered Long (bullish), and with -1 are Short (bearish).
    """
    summary = ""
    for i in range(len(ob_data)):
        if np.isnan(ob_data["OB"].iloc[i]):
            continue
        zone_type = "Long" if ob_data["OB"].iloc[i] == 1 else "Short"
        mitigated_idx = int(ob_data["MitigatedIndex"].iloc[i]) if ob_data["MitigatedIndex"].iloc[i] != 0 else len(df) - 1
        start_time = df.index[i]
        end_time = df.index[mitigated_idx]
        bottom = ob_data["Bottom"].iloc[i]
        top = ob_data["Top"].iloc[i]
        volume = ob_data["OBVolume"].iloc[i]
        percentage = ob_data["Percentage"].iloc[i]
        summary += f"{label_prefix} {zone_type} Zone:\n"
        summary += f"  Start Time: {start_time}\n"
        summary += f"  End Time:   {end_time}\n"
        summary += f"  Price Range: {bottom} to {top}\n"
        summary += f"  OB Volume:  {volume:.1f}\n"
        summary += f"  Percentage: {percentage}%\n\n"
    return summary

def process_data(data):
    """
    Process the data and return OB zone summaries.
    
    Args:
        data: List of dictionaries containing OHLCV data
    
    Returns:
        Tuple containing (internal_summary, swing_summary)
    """
    try:
        # Convert data to DataFrame
        df = pd.DataFrame(data)
        
        # Parse the time column and set it as the index
        df['time'] = pd.to_datetime(df['time'])
        df = df.set_index('time')
        
        # Convert column names to lowercase for consistency
        df.columns = [col.lower() for col in df.columns]
        
        # Define parameters
        internal_swing_length = 5
        swing_length = 20
        close_mitigation = False

        # Compute internal OB and swing OB using smartmoneyconcepts.smc.
        df_internal_swing = smc.swing_highs_lows(df, swing_length=internal_swing_length)
        try:
            df_internal_ob = smc.ob(df, df_internal_swing, close_mitigation=close_mitigation)
        except Exception as e:
            print("Error computing internal OB:", e, flush=True)
            df_internal_ob = pd.DataFrame()
        
        df_swing = smc.swing_highs_lows(df, swing_length=swing_length)
        try:
            df_swing_ob = smc.ob(df, df_swing, close_mitigation=close_mitigation)
        except Exception as e:
            print("Error computing swing OB:", e, flush=True)
            df_swing_ob = pd.DataFrame()
        
        # Build text summaries
        internal_summary = add_ob_summary(df, df_internal_ob, "Internal OB")
        swing_summary = add_ob_summary(df, df_swing_ob, "Swing OB")
        
        return internal_summary, swing_summary
    
    except Exception as e:
        print("Error processing data:", e, flush=True)
        return "", ""

def main():
    # Check if data is being piped through stdin
    if not sys.stdin.isatty():
        # Read JSON from stdin
        print("DEBUG: Reading JSON data from stdin", flush=True)
        try:
            data = json.load(sys.stdin)
            internal_summary, swing_summary = process_data(data)
        except Exception as e:
            print("Error reading JSON from stdin:", e, flush=True)
            sys.exit(1)
    
    # Otherwise, check if a file was provided
    elif len(sys.argv) > 1:
        json_file = sys.argv[1]
        print("DEBUG: Reading JSON file:", json_file, flush=True)
        try:
            # Read the JSON file
            with open(json_file, 'r') as f:
                data = json.load(f)
            internal_summary, swing_summary = process_data(data)
        except Exception as e:
            print("Error reading JSON file:", e, flush=True)
            sys.exit(1)
    
    # No data source provided
    else:
        print("Usage: python extract_ob_zones.py data.json", flush=True)
        print("  or pipe JSON data: cat data.json | python extract_ob_zones.py", flush=True)
        sys.exit(1)
    
    # Print the results
    print("Internal Order Blocks:", flush=True)
    print(internal_summary, flush=True)
    print("Swing Order Blocks:", flush=True)
    print(swing_summary, flush=True)

if __name__ == "__main__":
    main()