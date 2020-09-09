enum Unit {
  Second,
  Minute,
  Hour,
  Day,
  Month,
  Year,

  Inch,
  Foot,
  Mile,
}
  

// Specific instance of a unit, eg Mar 2020.
// Only makes sense in context of a hierarchy
class UnitValue

  Unit getUnit()
  Unit getBaseUnit()
  int getBaseValue()


// Only the hierarchy knows the order of units (a unit could appear in multiple hierarchies) and the base unit.
class UnitHierarchy

  Unit getLarger(Unit)

  Unit getSmaller(Unit)

  UnitValue getContaining(int start, int end)
  UnitValue getContaining(int, Unit)
  UnitValue getContaining(UnitValue)

  List<UnitValue> getContained(UnitValue)



class FixedUnitHierarchy extends UnitHierarchy

  FixedUnitHierarchy(List<Pair<Unit, int>> unitMultipliers) {
    this.units_ = unitMultipliers.map(x -> x.first());
    this.multipliers_ = new Map(unitMutipliers);
  }

  Unit getSmaller(Unit unit) {
    return this.unitMultipliers_


class ImperialDistanceUnitHierarchy extends FixedUnitHierarchy

  ImperialDistanceUnitHierarchy() {
    FixedUnitHierarchy([
      (Unit.Inch, 1),
      (Unit.Foot, 12),
      (Unit.Mile, 5280),
    ])




class CalendarUnitHierarchy extends UnitHierarchy
