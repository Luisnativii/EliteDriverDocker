package com.example.elitedriverbackend.services;

import com.example.elitedriverbackend.domain.dtos.AdminCustomerDTO.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.sql.*;
import java.time.*;
import java.util.*;

@Service @RequiredArgsConstructor
public class AdminCustomerService {
    private final NamedParameterJdbcTemplate jdbc;
    private final ReservationHoldService holds;
    private final Clock rentalClock;
    private final jakarta.persistence.EntityManager entityManager;
    private static final String ACTIVE = "r.payment_status = 'PAID' AND r.start_date::date <= :today AND r.end_date::date >= :today";
    private static final String PENDING = "(r.payment_status = 'PENDING' OR r.payment_status IS NULL) AND (r.hold_expires_at IS NULL OR r.hold_expires_at > :now)";
    private static final String MONTH = "r.payment_status = 'PAID' AND r.start_date::date <= :lastDay AND r.end_date::date >= :firstDay";
    private static final String CUSTOMERS = """
        SELECT u.id,u.first_name,u.last_name,u.email,u.phone_number,u.dui,u.created_at,u.last_login_at,
               COALESCE(rs.active_count,0) active_count, COALESCE(rs.month_rentals,0) month_rentals
        FROM users u LEFT JOIN LATERAL (
          SELECT COUNT(*) FILTER (WHERE %s) active_count,
                 COUNT(*) FILTER (WHERE %s) pending_count,
                 COUNT(*) FILTER (WHERE %s) month_rentals
          FROM reservations r WHERE r.user_id=u.id
        ) rs ON true WHERE u.role='CUSTOMER'
        """.formatted(ACTIVE,PENDING,MONTH);
    private static final String ORDER = " ORDER BY CASE WHEN rs.active_count > 0 THEN 0 WHEN rs.pending_count > 0 THEN 1 ELSE 2 END, u.last_login_at DESC NULLS LAST, u.created_at DESC NULLS LAST, LOWER(COALESCE(u.first_name,'') || ' ' || COALESCE(u.last_name,'')), u.id";

    public YearMonth month(String value) {
        try {
            YearMonth month = value == null || value.isBlank() ? YearMonth.now(rentalClock) : YearMonth.parse(value);
            if (month.getYear()<1900 || month.isAfter(YearMonth.now(rentalClock))) throw new IllegalArgumentException();
            return month;
        } catch (Exception ex) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Selecciona un mes válido, hasta el mes actual."); }
    }
    private MapSqlParameterSource parameters(YearMonth month,Instant now) {
        return new MapSqlParameterSource().addValue("today",java.sql.Date.valueOf(LocalDate.now(rentalClock)))
            .addValue("now",Timestamp.from(now)).addValue("firstDay",java.sql.Date.valueOf(month.atDay(1)))
            .addValue("lastDay",java.sql.Date.valueOf(month.atEndOfMonth()))
            .addValue("monthStart",Timestamp.from(month.atDay(1).atStartOfDay(rentalClock.getZone()).toInstant()))
            .addValue("monthEnd",Timestamp.from(month.plusMonths(1).atDay(1).atStartOfDay(rentalClock.getZone()).toInstant()));
    }
    public static Instant instant(ResultSet row,String name) throws SQLException {
        Timestamp value=row.getTimestamp(name);return value==null ? null : value.toInstant();
    }
    private Customer customer(ResultSet row) throws SQLException {
        return new Customer(row.getObject("id",UUID.class),row.getString("first_name"),row.getString("last_name"),
            row.getString("email"),row.getString("phone_number"),row.getString("dui"),instant(row,"created_at"),
            instant(row,"last_login_at"),row.getInt("active_count"),row.getInt("month_rentals"),new ArrayList<>());
    }
    private void attachHolds(List<Customer> customers,MapSqlParameterSource params) {
        if(customers.isEmpty())return;
        params.addValue("ids",customers.stream().map(Customer::id).toList());
        Map<UUID,Customer> indexed=new HashMap<>();customers.forEach(c->indexed.put(c.id(),c));
        jdbc.query("SELECT r.user_id,r.id,v.name,r.hold_expires_at FROM reservations r JOIN vehicles v ON v.id=r.car_id WHERE r.user_id IN (:ids) AND "+PENDING+" ORDER BY r.hold_expires_at NULLS LAST,r.id",params,(org.springframework.jdbc.core.RowCallbackHandler)row -> {
            indexed.get(row.getObject("user_id",UUID.class)).pendingHolds().add(new Hold(row.getObject("id",UUID.class),row.getString("name"),instant(row,"hold_expires_at")));
        });
    }
    @Transactional
    public CustomersPage list(String monthValue,String search,int requestedPage,int requestedSize) {
        Instant now=Instant.now(rentalClock);YearMonth selected=month(monthValue);
        holds.expireNow(now);entityManager.flush();
        int page=Math.max(0,requestedPage),size=Math.max(1,Math.min(100,requestedSize));
        String text=search==null ? "" : search.trim();
        if(text.length()>150)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"La búsqueda es demasiado larga.");
        var params=parameters(selected,now).addValue("search","%"+text.replace("!","!!").replace("%","!%").replace("_","!_")+"%")
            .addValue("limit",size).addValue("offset",(long)page*size);
        String filter=" AND CONCAT_WS(' ',u.first_name,u.last_name,u.email,u.dui,u.phone_number) ILIKE :search ESCAPE '!'";
        List<Customer> items=jdbc.query(CUSTOMERS+filter+ORDER+" LIMIT :limit OFFSET :offset",params,(row,n)->customer(row));
        attachHolds(items,params);
        Long total=jdbc.queryForObject("SELECT COUNT(*) FROM users u WHERE u.role='CUSTOMER'"+filter,params,Long.class);
        Stats stats=jdbc.queryForObject("""
          SELECT COUNT(DISTINCT u.id) total,
            COUNT(DISTINCT u.id) FILTER (WHERE u.created_at>=:monthStart AND u.created_at<:monthEnd) registered,
            COUNT(DISTINCT u.id) FILTER (WHERE %s) renters, COUNT(r.id) FILTER (WHERE %s) rentals,
            COUNT(DISTINCT u.id) FILTER (WHERE %s) active, COUNT(DISTINCT u.id) FILTER (WHERE %s) pending,
            COUNT(DISTINCT u.id) FILTER (WHERE u.created_at IS NULL) unknown_dates
          FROM users u LEFT JOIN reservations r ON r.user_id=u.id WHERE u.role='CUSTOMER'
          """.formatted(MONTH,MONTH,ACTIVE,PENDING),params,(row,n)->new Stats(row.getLong("total"),row.getLong("registered"),row.getLong("renters"),row.getLong("rentals"),row.getLong("active"),row.getLong("pending"),row.getLong("unknown_dates")));
        return new CustomersPage(items,total==null?0:total,page,size,selected.toString(),stats,now);
    }
    @Transactional
    public HistoryPage history(UUID id,String monthValue,int requestedPage,int requestedSize) {
        Instant now=Instant.now(rentalClock);holds.expireNow(now);entityManager.flush();
        var params=parameters(month(monthValue),now).addValue("id",id);
        List<Customer> customers=jdbc.query(CUSTOMERS+" AND u.id=:id",params,(row,n)->customer(row));
        if(customers.isEmpty())throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Cliente no encontrado.");
        attachHolds(customers,params);
        int page=Math.max(0,requestedPage),size=Math.max(1,Math.min(100,requestedSize));
        params.addValue("limit",size).addValue("offset",(long)page*size);
        Long total=jdbc.queryForObject("SELECT COUNT(*) FROM reservations WHERE user_id=:id",params,Long.class);
        List<Rental> items=jdbc.query("""
          SELECT r.id,r.car_id,v.name,r.start_date,r.end_date,r.total_price,r.payment_status,r.hold_expires_at,r.paid_at
          FROM reservations r JOIN vehicles v ON v.id=r.car_id WHERE r.user_id=:id
          ORDER BY CASE WHEN %s THEN 0 WHEN %s THEN 1 WHEN r.payment_status='PAID' THEN 2 ELSE 3 END,
            r.start_date DESC,r.id LIMIT :limit OFFSET :offset
          """.formatted(ACTIVE,PENDING),params,(row,n)->new Rental(row.getObject("id",UUID.class),row.getObject("car_id",UUID.class),row.getString("name"),
            row.getDate("start_date").toLocalDate(),row.getDate("end_date").toLocalDate(),row.getBigDecimal("total_price"),
            row.getString("payment_status")==null?"PENDING":row.getString("payment_status"),instant(row,"hold_expires_at"),instant(row,"paid_at")));
        return new HistoryPage(customers.getFirst(),items,total==null?0:total,page,size,now);
    }
}
