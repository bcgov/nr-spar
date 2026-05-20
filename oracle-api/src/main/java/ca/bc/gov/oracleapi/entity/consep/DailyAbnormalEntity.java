package ca.bc.gov.oracleapi.entity.consep;

import java.math.BigDecimal;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "CNS_T_DAILY_ABNORMAL", schema = "CONSEP")
@Schema(description = "This class represents the daily abnormal germination counts")
public class DailyAbnormalEntity {
  
  @Id
  @Column(name = "DAILY_GERM_SKEY", precision = 10, scale = 0)
  private BigDecimal dailyGermSkey;

  @Column(name = "RP1_NO_ABNRM_RE", precision = 5, scale = 0)
  private Integer rep1NoAbnrmRe;

  @Column(name = "RP1_NO_ABNRM_SR", precision = 5, scale = 0)
  private Integer rep1NoAbnrmSr;

  @Column(name = "RP1_NO_ABNRM_SH", precision = 5, scale = 0)
  private Integer rep1NoAbnrmSh;

  @Column(name = "RP1_NO_ABNRM_RN", precision = 5, scale = 0)
  private Integer rep1NoAbnrmRn;

  @Column(name = "RP1_NO_ABNRM_TH", precision = 5, scale = 0)  
  private Integer rep1NoAbnrmTh;

  @Column(name = "RP1_NO_ABNRM_TR", precision = 5, scale = 0)
  private Integer rep1NoAbnrmTr;

  @Column(name = "RP1_NO_ABNRM_TW", precision = 5, scale = 0)
  private Integer rep1NoAbnrmTw;

  @Column(name = "RP1_NO_ABNRM_CM", precision = 5, scale = 0)
  private Integer rep1NoAbnrmCm;

  @Column(name = "RP1_NO_ABNRM_WEAK", precision = 5, scale = 0)
  private Integer rep1NoAbnrmWeak;

  @Column(name = "RP1_NO_ABNRM_OTHER", precision = 5, scale = 0)
  private Integer rep1NoAbnrmOther;

  @Column(name = "RP1_NO_ABNRM_PRGRM", precision = 5, scale = 0)
  private Integer rep1NoAbnrmPrgrm;

  @Column(name = "RP2_NO_ABNRM_RE", precision = 5, scale = 0)
  private Integer rep2NoAbnrmRe;

  @Column(name = "RP2_NO_ABNRM_SR", precision = 5, scale = 0)
  private Integer rep2NoAbnrmSr;

  @Column(name = "RP2_NO_ABNRM_SH", precision = 5, scale = 0)
  private Integer rep2NoAbnrmSh;

  @Column(name = "RP2_NO_ABNRM_RN", precision = 5, scale = 0)
  private Integer rep2NoAbnrmRn;

  @Column(name = "RP2_NO_ABNRM_TH", precision = 5, scale = 0)  
  private Integer rep2NoAbnrmTh;

  @Column(name = "RP2_NO_ABNRM_TR", precision = 5, scale = 0)
  private Integer rep2NoAbnrmTr;

  @Column(name = "RP2_NO_ABNRM_TW", precision = 5, scale = 0)
  private Integer rep2NoAbnrmTw;

  @Column(name = "RP2_NO_ABNRM_CM", precision = 5, scale = 0)
  private Integer rep2NoAbnrmCm;

  @Column(name = "RP2_NO_ABNRM_WEAK", precision = 5, scale = 0)
  private Integer rep2NoAbnrmWeak;

  @Column(name = "RP2_NO_ABNRM_OTHER", precision = 5, scale = 0)
  private Integer rep2NoAbnrmOther;

  @Column(name = "RP2_NO_ABNRM_PRGRM", precision = 5, scale = 0)
  private Integer rep2NoAbnrmPrgrm;

  @Column(name = "RP3_NO_ABNRM_RE", precision = 5, scale = 0)
  private Integer rep3NoAbnrmRe;

  @Column(name = "RP3_NO_ABNRM_SR", precision = 5, scale = 0)
  private Integer rep3NoAbnrmSr;

  @Column(name = "RP3_NO_ABNRM_SH", precision = 5, scale = 0)
  private Integer rep3NoAbnrmSh;

  @Column(name = "RP3_NO_ABNRM_RN", precision = 5, scale = 0)
  private Integer rep3NoAbnrmRn;

  @Column(name = "RP3_NO_ABNRM_TH", precision = 5, scale = 0)  
  private Integer rep3NoAbnrmTh;

  @Column(name = "RP3_NO_ABNRM_TR", precision = 5, scale = 0)
  private Integer rep3NoAbnrmTr;

  @Column(name = "RP3_NO_ABNRM_TW", precision = 5, scale = 0)
  private Integer rep3NoAbnrmTw;

  @Column(name = "RP3_NO_ABNRM_CM", precision = 5, scale = 0)
  private Integer rep3NoAbnrmCm;

  @Column(name = "RP3_NO_ABNRM_WEAK", precision = 5, scale = 0)
  private Integer rep3NoAbnrmWeak;

  @Column(name = "RP3_NO_ABNRM_OTHER", precision = 5, scale = 0)
  private Integer rep3NoAbnrmOther;

  @Column(name = "RP3_NO_ABNRM_PRGRM", precision = 5, scale = 0)
  private Integer rep3NoAbnrmPrgrm;

  @Column(name = "RP4_NO_ABNRM_RE", precision = 5, scale = 0)
  private Integer rep4NoAbnrmRe;

  @Column(name = "RP4_NO_ABNRM_SR", precision = 5, scale = 0)
  private Integer rep4NoAbnrmSr;

  @Column(name = "RP4_NO_ABNRM_SH", precision = 5, scale = 0)
  private Integer rep4NoAbnrmSh;

  @Column(name = "RP4_NO_ABNRM_RN", precision = 5, scale = 0)
  private Integer rep4NoAbnrmRn;

  @Column(name = "RP4_NO_ABNRM_TH", precision = 5, scale = 0)  
  private Integer rep4NoAbnrmTh;

  @Column(name = "RP4_NO_ABNRM_TR", precision = 5, scale = 0)
  private Integer rep4NoAbnrmTr;

  @Column(name = "RP4_NO_ABNRM_TW", precision = 5, scale = 0)
  private Integer rep4NoAbnrmTw;

  @Column(name = "RP4_NO_ABNRM_CM", precision = 5, scale = 0)
  private Integer rep4NoAbnrmCm;

  @Column(name = "RP4_NO_ABNRM_WEAK", precision = 5, scale = 0)
  private Integer rep4NoAbnrmWeak;

  @Column(name = "RP4_NO_ABNRM_OTHER", precision = 5, scale = 0)
  private Integer rep4NoAbnrmOther;

  @Column(name = "RP4_NO_ABNRM_PRGRM", precision = 5, scale = 0)
  private Integer rep4NoAbnrmPrgrm;
}
