import React, { useState, useEffect } from "react";
import "./App.css";

// Define interfaces for data structures
interface YearData {
  C: number;
  M: number;
  i: number | null;
}

interface StaticDataType {
  [year: string]: YearData;
}

interface MoneyDataType {
  [year: string]: number;
}

interface MonthDataType {
  [year: string]: number;
}

interface RateDataType {
  [year: string]: string;
}

interface CalculationResult {
  ReValue: Record<string, number>;
  AdjustedAmount: Record<string, number>;
  discountFactors: Record<string, number>;
  finalAdjustedAmount: number;
  pensionPercentage: number;
  pensionAmount: number;
  cumMonths: Record<string, number>;
  years: string[];
}

const staticData: StaticDataType = {
	"2541": { C: 16250, M: 15000, i: 1 },
	"2542": { C: 16250, M: 15000, i: 1 },
	"2543": { C: 16250, M: 15000, i: 1.013532473 },
	"2544": { C: 16250, M: 15000, i: 1.002681959 },
	"2545": { C: 16250, M: 15000, i: 1.00730799 },
	"2546": { C: 16250, M: 15000, i: 1.012950052 },
	"2547": { C: 16250, M: 15000, i: 1.038295942 },
	"2548": { C: 16250, M: 15000, i: 1.040860045 },
	"2549": { C: 16250, M: 15000, i: 1.032125791 },
	"2550": { C: 16250, M: 15000, i: 1.036936017 },
	"2551": { C: 16250, M: 15000, i: 1.037769939 },
	"2552": { C: 16250, M: 15000, i: 1.016085747 },
	"2553": { C: 16250, M: 15000, i: 1.02656197 },
	"2554": { C: 16250, M: 15000, i: 1.119890167 },
	"2555": { C: 16250, M: 15000, i: 1.095356487 },
	"2556": { C: 16250, M: 15000, i: 1.022665963 },
	"2557": { C: 16250, M: 15000, i: 1.014171773 },
	"2558": { C: 16250, M: 15000, i: 1.033584114 },
	"2559": { C: 16250, M: 15000, i: 1.021008643 },
	"2560": { C: 16250, M: 15000, i: 1.011972516 },
	"2561": { C: 16250, M: 15000, i: 1.014638193 },
	"2562": { C: 16250, M: 15000, i: 1.00656399 },
	"2563": { C: 16250, M: 15000, i: 1.021598019 },
	"2564": { C: 16250, M: 15000, i: 1.012048193 },
	"2565": { C: 16250, M: 15000, i: 1.01207483 },
	"2566": { C: 16250, M: 15000, i: 1.023273399 },
	"2567": { C: 16250, M: 15000, i: 1.043889845 },
	"2568": { C: 16250, M: 15000, i: null },
	"2569": { C: 17500, M: 17500, i: null },
	"2570": { C: 17500, M: 17500, i: null },
	"2571": { C: 17500, M: 17500, i: null },
	"2572": { C: 20000, M: 20000, i: null },
	"2573": { C: 20000, M: 20000, i: null },
	"2574": { C: 23000, M: 23000, i: null },
	"2575": { C: 23000, M: 23000, i: null },
	"2576": { C: 23000, M: 23000, i: null },
	"2577": { C: 23000, M: 23000, i: null },
	"2578": { C: 23000, M: 23000, i: null },
	"2579": { C: 23000, M: 23000, i: null },
	"2580": { C: 23000, M: 23000, i: null },
};

const getYearArray = (start: number, end: number): string[] => {
	const years: string[] = [];
	for (let y = start; y <= end; y++) {
		years.push(String(y));
	}
	return years;
};

const computeDiscountFactor = (years: string[], tIdx: number, dataOverride: Record<string, YearData>): number => {
	if (tIdx < 4) return 1;
	let pureRevaluedAvg = 1;
	for (let k = tIdx - 4; k < tIdx; k++) {
		const yr = years[k];
		pureRevaluedAvg *= dataOverride[yr].i as number; // using type assertion since we know these values aren't null in this context
	}
	let sum = 1;
	for (let j = tIdx - 4; j < tIdx; j++) {
		let prod = 1;
		for (let k = tIdx - 4; k <= j; k++) {
			prod *= dataOverride[years[k]].i as number;
		}
		sum += prod;
	}
	const oldNominalAvg = sum / 5;
	return pureRevaluedAvg / oldNominalAvg;
};

const calculateCARE = (
  startYear: number, 
  endYear: number, 
  moneyData: MoneyDataType, 
  monthData: MonthDataType, 
  rateData: RateDataType
): CalculationResult => {
	const years = getYearArray(startYear, endYear);
	const n = years.length;
	const ReValue: Record<string, number> = {};
	const AdjustedAmount: Record<string, number> = {};
	const cumMonths: Record<string, number> = {};
	const discountFactors: Record<string, number> = {};

	const dataOverride: Record<string, YearData> = {};
	years.forEach((yr) => {
		if (!staticData[yr]) {
			throw new Error(`ไม่มีข้อมูลสำหรับปี ${yr}`);
		}
		let iVal = staticData[yr].i;
		if (iVal === null || parseInt(yr) >= 2568) {
			if (rateData[yr] === undefined || rateData[yr] === "") {
				throw new Error(`กรุณากรอกค่า i สำหรับปี ${yr}`);
			}
			iVal = parseFloat(rateData[yr]);
			if (isNaN(iVal)) {
				throw new Error(`ค่า i สำหรับปี ${yr} ไม่ถูกต้อง`);
			}
			if (iVal < 1) {
				throw new Error(`ค่า i สำหรับปี ${yr} ต้องมีค่าตั้งแต่ 1 ขึ้นไป`);
			}
		}
		dataOverride[yr] = { ...staticData[yr], i: iVal };
	});

	let previousReValue = 0;
	let previousAdjustedAmount = 0;
	let previousCumMonths = 0;

	for (let idx = 0; idx < n; idx++) {
		const yr = years[idx];
		const data = dataOverride[yr];
		const P = moneyData[yr];
		const w = monthData[yr];
		const currentC = data.C;
		const currentM = data.M;

		const W_prev = previousCumMonths;
		const W_current = previousCumMonths + w;

		let currentReValue: number;
		if (idx === 0) {
			currentReValue = P;
		} else {
			const prevYear = years[idx - 1];
			const i_prev = dataOverride[prevYear].i as number;
			const corrected_i_prev = i_prev < 1 ? 1 : i_prev;
			const candidate = previousReValue * corrected_i_prev;
			const cappedCandidate = Math.min(candidate, currentC);
			currentReValue = (cappedCandidate * W_prev + P * w) / W_current;
		}
		cumMonths[yr] = W_current;
		ReValue[yr] = currentReValue;

		const discountFactor = computeDiscountFactor(years, idx, dataOverride);
		discountFactors[yr] = discountFactor;

		const part1 = Math.min(currentReValue / discountFactor, currentM);
		let part2 = currentReValue;
		if (idx > 0) {
			part2 = Math.min(previousAdjustedAmount, currentReValue);
		}
		const currentAdjustedAmount = Math.max(part1, part2);
		AdjustedAmount[yr] = currentAdjustedAmount;

		previousReValue = currentReValue;
		previousAdjustedAmount = currentAdjustedAmount;
		previousCumMonths = W_current;
	}

	const T = years[n - 1];
	const finalAdjustedAmount = AdjustedAmount[T];
	const totalMonths = cumMonths[T];
	let pensionPercentage = 0;

	if (totalMonths <= 180) {
		pensionPercentage = 0.20;
	} else {
		pensionPercentage = 0.20 + 0.00125 * (totalMonths - 180);
	}
	const pensionAmount = pensionPercentage * finalAdjustedAmount;

	return {
		ReValue,
		AdjustedAmount,
		discountFactors,
		finalAdjustedAmount,
		pensionPercentage,
		pensionAmount,
		cumMonths,
		years,
	};
};

const CAREPensionCalculator: React.FC = () => {
	const [startYear, setStartYear] = useState<number>(2542);
	const [tempStartYear, setTempStartYear] = useState<number>(2542);
	const [endYear, setEndYear] = useState<number>(2569);
	const [tempEndYear, setTempEndYear] = useState<number>(2569);
	const [moneyData, setMoneyData] = useState<MoneyDataType>({});
	const [monthData, setMonthData] = useState<MonthDataType>({});
	const [rateData, setRateData] = useState<RateDataType>({});
	const [result, setResult] = useState<CalculationResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isInitialized, setIsInitialized] = useState<boolean>(false);
	const [showDetails, setShowDetails] = useState<boolean>(false);

	// Handle start year keypress
	const handleStartYearKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
		if (e.key === 'Enter') {
			const newStartYear = parseInt(tempStartYear.toString());
			if (newStartYear < 2541) {
				setTempStartYear(2541);
				setStartYear(2541);
				setError("ปีเริ่มต้นต้องไม่น้อยกว่า 2541");
			} else if (newStartYear > 2580) {
				setTempStartYear(2580);
				setStartYear(2580);
				setError("ปีเริ่มต้นต้องไม่เกิน 2580");
			} else if (newStartYear > endYear) {
				setEndYear(newStartYear);
				setTempEndYear(newStartYear);
				setStartYear(newStartYear);
				setError("ปรับปีสุดท้ายให้เท่ากับปีเริ่มต้น");
			} else {
				setStartYear(newStartYear);
				setError(null);
			}
			initializeYearData(newStartYear, endYear);
		}
	};

	// Handle end year keypress
	const handleEndYearKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
		if (e.key === 'Enter') {
			const newEndYear = parseInt(tempEndYear.toString());
			if (newEndYear > 2580) {
				setTempEndYear(2580);
				setEndYear(2580);
				setError("ปีสุดท้ายต้องไม่เกิน 2580");
			} else if (newEndYear < startYear) {
				setTempEndYear(startYear);
				setEndYear(startYear);
				setError("ปีสุดท้ายต้องมากกว่าหรือเท่ากับปีเริ่มต้น");
			} else {
				setEndYear(newEndYear);
				setError(null);
			}
			initializeYearData(startYear, newEndYear);
		}
	};

	// Handle rate data input with validation
	const handleRateDataChange = (yr: string, value: string): void => {
		let newValue = value;
		
		// If the value is not empty, validate it
		if (newValue !== "") {
			const floatValue = parseFloat(newValue);
			
			// Don't allow values less than 1
			if (floatValue < 1) {
				newValue = "1";
			}
		}
		
		setRateData({
			...rateData,
			[yr]: newValue
		});
	};

	// Initialize data for the years range
	const initializeYearData = (start: number, end: number): void => {
		const years = getYearArray(start, end);
		setMoneyData((prev) => {
			const newData: MoneyDataType = {};
			years.forEach((yr) => {
				newData[yr] = prev[yr] !== undefined ? prev[yr] : 15000;
			});
			return newData;
		});
		setMonthData((prev) => {
			const newData: MonthDataType = {};
			years.forEach((yr) => {
				newData[yr] = prev[yr] !== undefined ? prev[yr] : 12;
			});
			return newData;
		});
		setRateData((prev) => {
			const newData: RateDataType = {};
			years.forEach((yr) => {
				if (staticData[yr] && (staticData[yr].i === null || parseInt(yr) >= 2568)) {
					newData[yr] = prev[yr] !== undefined ? prev[yr] : "1.04";
				} else if (staticData[yr] && staticData[yr].i !== null) {
					newData[yr] = prev[yr] !== undefined ? prev[yr] : staticData[yr].i.toString();
				}
			});
			return newData;
		});
		setIsInitialized(true);
	};

	// Initial setup (only once)
	useEffect(() => {
		initializeYearData(startYear, endYear);
	}, []);

	const handleCalculation = (): void => {
		setError(null);
		try {
			const years = getYearArray(startYear, endYear);
			for (const yr of years) {
				if (isNaN(moneyData[yr]) || moneyData[yr] <= 0) {
					throw new Error(`ค่าเงินค่าจ้างไม่ถูกต้องสำหรับปี ${yr}`);
				}
				if (isNaN(monthData[yr]) || monthData[yr] <= 0) {
					throw new Error(`จำนวนเดือนไม่ถูกต้องสำหรับปี ${yr}`);
				}
                
				if (parseInt(yr) >= 2568) {
					if (isNaN(parseFloat(rateData[yr])) || parseFloat(rateData[yr]) <= 0) {
						throw new Error(`ค่า i ไม่ถูกต้องสำหรับปี ${yr}`);
					}
					if (parseFloat(rateData[yr]) < 1) {
						throw new Error(`ค่า i สำหรับปี ${yr} ต้องมีค่าตั้งแต่ 1 ขึ้นไป`);
					}
				}
			}
			const calcResult = calculateCARE(startYear, endYear, moneyData, monthData, rateData);
			setResult(calcResult);
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("Error during calculation");
			}
			setResult(null);
		}
	};

	if (!isInitialized) {
		return <div>Loading...</div>;
	}

	return (
		<div className="bg-gray-50 p-6 rounded-lg shadow-md max-w-4xl mx-auto">
			<h1 className="text-2xl font-bold text-center mb-6 text-blue-700">CARE Pension Calculator</h1>
			
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
				<div>
					<label className="block text-gray-700 mb-2">
						Start Year (เช่น 2541):
						<input
							type="number"
							className="w-full p-2 border rounded mt-1"
							value={tempStartYear}
							onChange={(e) => setTempStartYear(parseInt(e.target.value))}
							onKeyPress={handleStartYearKeyPress}
							min={2541}
							max={2580}
						/>
						<span className="text-xs text-gray-500">กด Enter เพื่อยืนยัน</span>
					</label>
				</div>
				<div>
					<label className="block text-gray-700 mb-2">
						End Year (เช่น 2556):
						<input
							type="number"
							className="w-full p-2 border rounded mt-1"
							value={tempEndYear}
							onChange={(e) => setTempEndYear(parseInt(e.target.value))}
							onKeyPress={handleEndYearKeyPress}
							min={startYear}
							max={2580}
						/>
						<span className="text-xs text-gray-500">กด Enter เพื่อยืนยัน</span>
					</label>
				</div>
			</div>

			<div className="mb-6">
				<h2 className="text-xl font-semibold mb-3">กรอกข้อมูลประจำปี</h2>
				<div className="overflow-x-auto">
					<table className="w-full border-collapse border border-gray-300">
						<thead className="bg-gray-100">
							<tr>
								<th className="p-2 border">ปี</th>
								<th className="p-2 border">เงินค่าจ้าง (P[t])</th>
								<th className="p-2 border">จำนวนเดือน (w[t])</th>
								<th className="p-2 border">ค่า i[t]</th>
							</tr>
						</thead>
						<tbody>
							{getYearArray(startYear, endYear).map((yr) => (
								<tr key={yr} className="hover:bg-gray-50">
									<td className="p-2 border text-center">{yr}</td>
									<td className="p-2 border">
										<input
											type="number"
											className="w-full p-1 border rounded"
											value={moneyData[yr] || 0}
											onChange={(e) =>
												setMoneyData({
													...moneyData,
													[yr]: parseFloat(e.target.value),
												})
											}
											min="1"
										/>
									</td>
									<td className="p-2 border">
										<input
											type="number"
											className="w-full p-1 border rounded"
											value={monthData[yr] || 0}
											onChange={(e) =>
												setMonthData({
													...monthData,
													[yr]: parseFloat(e.target.value),
												})
											}
											min="1"
											max="12"
										/>
									</td>
									<td className="p-2 border">
										{(staticData[yr] && staticData[yr].i !== null && parseInt(yr) < 2568) ? (
											<span>{staticData[yr].i}</span>
										) : (
											<input
												type="number"
												step="0.001"
												className="w-full p-1 border rounded"
												value={rateData[yr] || ""}
												onChange={(e) => handleRateDataChange(yr, e.target.value)}
												min="1"
												placeholder="Enter i (≥ 1)"
											/>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
			
			<button 
				className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mb-4"
				onClick={handleCalculation}
			>
				คำนวณ
			</button>
			
			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					<strong>Error:</strong> {error}
				</div>
			)}
			
			{result && (
				<div className="mt-6 bg-white p-4 rounded-lg border border-gray-200">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
						<div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
							<h3 className="text-lg font-medium text-gray-700 mb-2">AdjustedAmount(T)</h3>
							<p className="text-2xl font-bold text-blue-800">{result.finalAdjustedAmount.toFixed(2)}</p>
						</div>
						<div className="bg-green-50 p-4 rounded-lg border border-green-200">
							<h3 className="text-lg font-medium text-gray-700 mb-2">เปอร์เซนต์เงินบำนาญ</h3>
							<p className="text-2xl font-bold text-green-800">{(result.pensionPercentage * 100).toFixed(3)}%</p>
						</div>
						<div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
							<h3 className="text-lg font-medium text-gray-700 mb-2">จำนวนเงินบำนาญ</h3>
							<p className="text-2xl font-bold text-purple-800">{result.pensionAmount.toFixed(2)}</p>
						</div>
					</div>
					
					<button 
						className="text-blue-600 hover:text-blue-800 font-medium mb-2 flex items-center"
						onClick={() => setShowDetails(!showDetails)}
					>
						{showDetails ? "ซ่อนตารางคำนวณ ▲" : "แสดงตารางคำนวณ ▼"}
					</button>
					
					{showDetails && (
						<div className="overflow-x-auto">
							<table className="w-full border-collapse border border-gray-300 text-sm">
								<thead className="bg-gray-100">
									<tr>
										<th className="p-2 border">ปี</th>
										<th className="p-2 border">ReValue</th>
										<th className="p-2 border">AdjustedAmount</th>
										<th className="p-2 border">Discount Factor</th>
										<th className="p-2 border">สะสมเดือน (W)</th>
									</tr>
								</thead>
								<tbody>
									{result.years.map((yr) => (
										<tr key={yr} className="hover:bg-gray-50">
											<td className="p-2 border text-center">{yr}</td>
											<td className="p-2 border text-right">{result.ReValue[yr].toFixed(2)}</td>
											<td className="p-2 border text-right">{result.AdjustedAmount[yr].toFixed(2)}</td>
											<td className="p-2 border text-right">{result.discountFactors[yr].toFixed(4)}</td>
											<td className="p-2 border text-right">{result.cumMonths[yr]}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default CAREPensionCalculator;